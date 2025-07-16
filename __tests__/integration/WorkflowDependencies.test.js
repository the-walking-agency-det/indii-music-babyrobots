import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { mockArtistData, mockRoyaltyData, mockPrintOrderData } from '../__fixtures__/mockData'
import { apiService } from '../__mocks__/apiService'
import ArtistWorkflow from '../../workflows/ArtistWorkflow'
import { WorkflowProvider } from '../../contexts/WorkflowContext'

jest.mock('../../services/apiService', () => apiService)

describe('Cross-Workflow Dependencies', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  test('artist must complete onboarding before receiving royalties', async () => {
    // Setup incomplete artist profile
    apiService.artist.getProfile.mockResolvedValueOnce({
      ...mockArtistData.profile,
      onboardingComplete: false
    })

    render(
      <WorkflowProvider>
        <ArtistWorkflow />
      </WorkflowProvider>
    )

    // Try to access royalties
    fireEvent.click(screen.getByText(/view royalties/i))

    // Should see onboarding prompt
    expect(await screen.findByText(/complete onboarding first/i)).toBeInTheDocument()
    expect(screen.getByText(/\d+ steps remaining/i)).toBeInTheDocument()

    // Complete onboarding
    fireEvent.click(screen.getByText(/complete profile/i))
    await fillOnboardingForm()

    // Should now see royalties
    expect(await screen.findByText(/royalty dashboard/i)).toBeInTheDocument()
  })

  test('print order requires verified artist account', async () => {
    // Setup unverified artist
    apiService.artist.getProfile.mockResolvedValueOnce({
      ...mockArtistData.profile,
      verified: false
    })

    render(
      <WorkflowProvider>
        <ArtistWorkflow />
      </WorkflowProvider>
    )

    // Try to create print order
    fireEvent.click(screen.getByText(/create print order/i))

    // Should see verification prompt
    expect(await screen.findByText(/verification required/i)).toBeInTheDocument()

    // Complete verification
    fireEvent.click(screen.getByText(/verify account/i))
    await completeVerification()

    // Should now see print order form
    expect(await screen.findByText(/print order form/i)).toBeInTheDocument()
  })

  test('royalty history affects order limits', async () => {
    // Setup artist with low royalty history
    apiService.royalty.getHistory.mockResolvedValueOnce({
      totalEarnings: 100,
      lastPayment: '2025-01-01'
    })

    render(
      <WorkflowProvider>
        <ArtistWorkflow />
      </WorkflowProvider>
    )

    // Try to create large print order
    fireEvent.click(screen.getByText(/create print order/i))
    
    const quantityInput = screen.getByLabelText(/quantity/i)
    fireEvent.change(quantityInput, { target: { value: '1000' } })

    // Should see limit warning
    expect(await screen.findByText(/order limit: 200 units/i)).toBeInTheDocument()
    expect(screen.getByText(/based on royalty history/i)).toBeInTheDocument()

    // Update royalty history
    apiService.royalty.getHistory.mockResolvedValueOnce({
      totalEarnings: 5000,
      lastPayment: '2025-06-01'
    })

    // Refresh limits
    fireEvent.click(screen.getByText(/refresh limits/i))

    // Should see increased limit
    expect(await screen.findByText(/order limit: 1000 units/i)).toBeInTheDocument()
  })

  // Helper functions
  async function fillOnboardingForm() {
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: mockArtistData.profile.name }
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: mockArtistData.profile.email }
    })
    fireEvent.click(screen.getByText(/save/i))
    
    await waitFor(() => {
      expect(apiService.artist.update).toHaveBeenCalled()
    })
  }

  async function completeVerification() {
    // Upload verification document
    const fileInput = screen.getByLabelText(/upload id/i)
    Object.defineProperty(fileInput, 'files', {
      value: [new File(['id'], 'artist-id.pdf')]
    })
    fireEvent.change(fileInput)

    // Submit verification
    fireEvent.click(screen.getByText(/submit verification/i))
    
    await waitFor(() => {
      expect(apiService.artist.verify).toHaveBeenCalled()
    })
  }
})
