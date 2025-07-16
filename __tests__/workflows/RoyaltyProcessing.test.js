import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { mockRoyaltyData } from '../__fixtures__/mockData'
import { apiService } from '../__mocks__/apiService'
import RoyaltyProcessing from '../../workflows/RoyaltyProcessing'

jest.mock('../../services/apiService', () => apiService)

describe('Royalty Processing Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('processes royalty statement successfully', async () => {
    render(<RoyaltyProcessing />)

    // Upload royalty data file
    const fileInput = screen.getByLabelText(/upload statement/i)
    Object.defineProperty(fileInput, 'files', {
      value: [new File(['data'], 'royalties.csv')]
    })
    fireEvent.change(fileInput)

    // Verify upload started
    expect(await screen.findByText(/processing/i)).toBeInTheDocument()

    // Verify API calls
    await waitFor(() => {
      expect(apiService.royalty.processStatement).toHaveBeenCalled()
      expect(apiService.royalty.generateReport).toHaveBeenCalled()
    })

    // Check success state
    expect(screen.getByText(/processing complete/i)).toBeInTheDocument()
    expect(screen.getByText(/report ready/i)).toBeInTheDocument()
  })

  test('validates statement data before processing', async () => {
    render(<RoyaltyProcessing />)

    // Upload invalid file
    const fileInput = screen.getByLabelText(/upload statement/i)
    Object.defineProperty(fileInput, 'files', {
      value: [new File(['invalid'], 'wrong.txt')]
    })
    fireEvent.change(fileInput)

    // Check validation error
    expect(await screen.findByText(/invalid file format/i)).toBeInTheDocument()
    expect(apiService.royalty.processStatement).not.toHaveBeenCalled()
  })

  test('handles processing errors gracefully', async () => {
    // Mock processing failure
    apiService.royalty.processStatement.mockRejectedValueOnce(
      new Error('Processing failed')
    )

    render(<RoyaltyProcessing />)

    // Upload file
    const fileInput = screen.getByLabelText(/upload statement/i)
    Object.defineProperty(fileInput, 'files', {
      value: [new File(['data'], 'royalties.csv')]
    })
    fireEvent.change(fileInput)

    // Verify error handling
    expect(await screen.findByText(/processing failed/i)).toBeInTheDocument()
    expect(screen.getByText(/try again/i)).toBeInTheDocument()
  })

  test('calculates royalties correctly', async () => {
    render(<RoyaltyProcessing />)

    // Upload statement
    const fileInput = screen.getByLabelText(/upload statement/i)
    Object.defineProperty(fileInput, 'files', {
      value: [new File([JSON.stringify(mockRoyaltyData)], 'royalties.json')]
    })
    fireEvent.change(fileInput)

    // Wait for processing
    await waitFor(() => {
      expect(screen.getByText(/\$2,681.50/)).toBeInTheDocument()
    })

    // Verify platform breakdowns
    expect(screen.getByText(/spotify: \$1,250.50/i)).toBeInTheDocument()
    expect(screen.getByText(/apple music: \$980.25/i)).toBeInTheDocument()
    expect(screen.getByText(/youtube: \$450.75/i)).toBeInTheDocument()
  })

  test('supports automatic notification after processing', async () => {
    render(<RoyaltyProcessing />)

    // Enable notifications
    fireEvent.click(screen.getByLabelText(/notify artists/i))

    // Upload and process
    const fileInput = screen.getByLabelText(/upload statement/i)
    Object.defineProperty(fileInput, 'files', {
      value: [new File(['data'], 'royalties.csv')]
    })
    fireEvent.change(fileInput)

    // Verify notifications sent
    await waitFor(() => {
      expect(apiService.royalty.notify).toHaveBeenCalled()
    })
    expect(screen.getByText(/notifications sent/i)).toBeInTheDocument()
  })
})
