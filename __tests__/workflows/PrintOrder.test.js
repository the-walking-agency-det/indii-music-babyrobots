import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { mockPrintOrderData } from '../__fixtures__/mockData'
import { apiService } from '../__mocks__/apiService'
import PrintOrder from '../../workflows/PrintOrder'

jest.mock('../../services/apiService', () => apiService)

describe('Print Order Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('processes emergency print order successfully', async () => {
    render(<PrintOrder />)

    // Fill order details
    fireEvent.change(screen.getByLabelText(/product sku/i), {
      target: { value: 'VINYL-001' }
    })
    fireEvent.change(screen.getByLabelText(/quantity/i), {
      target: { value: '500' }
    })
    
    // Add shipping details
    fireEvent.change(screen.getByLabelText(/street/i), {
      target: { value: mockPrintOrderData.order.shipping.address.street }
    })
    fireEvent.change(screen.getByLabelText(/city/i), {
      target: { value: mockPrintOrderData.order.shipping.address.city }
    })

    // Submit order
    fireEvent.click(screen.getByText(/submit order/i))

    // Verify API calls
    await waitFor(() => {
      expect(apiService.printOrder.checkInventory).toHaveBeenCalled()
      expect(apiService.printOrder.create).toHaveBeenCalled()
      expect(apiService.printOrder.dispatch).toHaveBeenCalled()
    })

    // Check success state
    expect(screen.getByText(/order processed/i)).toBeInTheDocument()
    expect(screen.getByText(/tracking: TRACK-001/i)).toBeInTheDocument()
  })

  test('validates inventory before processing', async () => {
    // Mock insufficient inventory
    apiService.printOrder.checkInventory.mockResolvedValueOnce({
      available: false,
      stock: { 'VINYL-001': 100 }
    })

    render(<PrintOrder />)

    // Fill order details
    fireEvent.change(screen.getByLabelText(/product sku/i), {
      target: { value: 'VINYL-001' }
    })
    fireEvent.change(screen.getByLabelText(/quantity/i), {
      target: { value: '500' }
    })

    // Submit order
    fireEvent.click(screen.getByText(/submit order/i))

    // Check inventory error
    expect(await screen.findByText(/insufficient inventory/i)).toBeInTheDocument()
    expect(screen.getByText(/only 100 units available/i)).toBeInTheDocument()
  })

  test('handles shipping validation', async () => {
    render(<PrintOrder />)

    // Submit without shipping details
    fireEvent.click(screen.getByText(/submit order/i))

    // Check validation errors
    expect(screen.getByText(/street is required/i)).toBeInTheDocument()
    expect(screen.getByText(/city is required/i)).toBeInTheDocument()

    // Fill invalid zip code
    fireEvent.change(screen.getByLabelText(/zip/i), {
      target: { value: '123' }
    })
    expect(screen.getByText(/invalid zip code/i)).toBeInTheDocument()
  })

  test('supports rush processing', async () => {
    render(<PrintOrder />)

    // Enable rush processing
    fireEvent.click(screen.getByLabelText(/rush processing/i))

    // Fill minimum required details
    fireEvent.change(screen.getByLabelText(/product sku/i), {
      target: { value: 'VINYL-001' }
    })
    fireEvent.change(screen.getByLabelText(/quantity/i), {
      target: { value: '100' }
    })

    // Submit order
    fireEvent.click(screen.getByText(/submit order/i))

    // Verify rush processing
    await waitFor(() => {
      expect(apiService.printOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          rush: true,
          priority: 'high'
        })
      )
    })
  })

  test('calculates shipping costs correctly', async () => {
    render(<PrintOrder />)

    // Fill order details
    fireEvent.change(screen.getByLabelText(/product sku/i), {
      target: { value: 'VINYL-001' }
    })
    fireEvent.change(screen.getByLabelText(/quantity/i), {
      target: { value: '500' }
    })

    // Select express shipping
    fireEvent.click(screen.getByLabelText(/express shipping/i))

    // Check cost calculation
    expect(screen.getByText(/order total: \$6,495.00/i)).toBeInTheDocument()
    expect(screen.getByText(/shipping: \$149.99/i)).toBeInTheDocument()
  })
})
