import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { mockArtistData, mockRoyaltyData, mockPrintOrderData } from '../__fixtures__/mockData'
import { apiService } from '../__mocks__/apiService'

jest.mock('../../services/apiService', () => apiService)

import ArtistOnboarding from '../../workflows/ArtistOnboarding'
import RoyaltyProcessing from '../../workflows/RoyaltyProcessing'
import PrintOrder from '../../workflows/PrintOrder'

describe('End-to-End Workflows', () => {
  test('complete artist onboarding flow', async () => {
    render(<ArtistOnboarding />)

    // Simulate artist sign up and completion
    fireEvent.click(screen.getByText(/sign up/i))

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: mockArtistData.profile.name }})
    fireEvent.click(screen.getByText(/submit/i))

    // Assume successful API calls
    expect(apiService.artist.create).toHaveBeenCalled()
    expect(await screen.findByText(/welcome, Test Artist/i)).toBeInTheDocument()
  })

  test('royalty statement processing pipeline', async () => {
    render(<RoyaltyProcessing />)

    // Simulate data upload and processing
    fireEvent.click(screen.getByText(/upload data/i))
    expect(apiService.royalty.processStatement).toHaveBeenCalled()

    expect(await screen.findByText(/processing complete/i)).toBeInTheDocument()
    expect(screen.getByText(/statement available/i)).toBeInTheDocument()
  })

  test('emergency print order workflow', async () => {
    render(<PrintOrder />)

    // Trigger emergency print order
    fireEvent.click(screen.getByText(/create order/i))
    expect(apiService.printOrder.create).toHaveBeenCalled()

    expect(await screen.findByText(/order processed/i)).toBeInTheDocument()
    expect(screen.getByText(/confirmation sent/i)).toBeInTheDocument()
  })
})

