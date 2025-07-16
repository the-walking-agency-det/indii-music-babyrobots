import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { mockArtistData } from '../__fixtures__/mockData'
import { apiService } from '../__mocks__/apiService'
import ArtistOnboarding from '../../workflows/ArtistOnboarding'

jest.mock('../../services/apiService', () => apiService)

describe('Artist Onboarding Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('completes full onboarding process', async () => {
    render(<ArtistOnboarding />)

    // Step 1: Basic Information
    fireEvent.change(screen.getByLabelText(/name/i), { 
      target: { value: mockArtistData.profile.name }
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: mockArtistData.profile.email }
    })
    fireEvent.change(screen.getByLabelText(/genre/i), {
      target: { value: mockArtistData.profile.genre }
    })
    fireEvent.click(screen.getByText(/next/i))

    // Step 2: Document Upload
    const w9Input = screen.getByLabelText(/w9 form/i)
    const contractInput = screen.getByLabelText(/contract/i)
    
    Object.defineProperty(w9Input, 'files', {
      value: [new File(['w9'], mockArtistData.documents.w9Form)]
    })
    Object.defineProperty(contractInput, 'files', {
      value: [new File(['contract'], mockArtistData.documents.contract)]
    })
    
    fireEvent.change(w9Input)
    fireEvent.change(contractInput)
    fireEvent.click(screen.getByText(/next/i))

    // Step 3: Banking Information
    fireEvent.change(screen.getByLabelText(/routing number/i), {
      target: { value: mockArtistData.bankInfo.routingNumber }
    })
    fireEvent.change(screen.getByLabelText(/account number/i), {
      target: { value: mockArtistData.bankInfo.accountNumber }
    })
    fireEvent.click(screen.getByText(/complete/i))

    // Verify API calls
    await waitFor(() => {
      expect(apiService.artist.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockArtistData.profile.name,
          email: mockArtistData.profile.email
        })
      )
      expect(apiService.artist.uploadDocument).toHaveBeenCalledTimes(2)
      expect(apiService.artist.verifyBankInfo).toHaveBeenCalled()
    })

    // Verify completion
    expect(await screen.findByText(/onboarding complete/i)).toBeInTheDocument()
  })

  test('handles validation errors appropriately', async () => {
    render(<ArtistOnboarding />)

    // Try to proceed without required fields
    fireEvent.click(screen.getByText(/next/i))
    
    expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()

    // Test invalid email
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid-email' }
    })
    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
  })

  test('handles API errors gracefully', async () => {
    // Mock API failure
    apiService.artist.create.mockRejectedValueOnce(new Error('API Error'))

    render(<ArtistOnboarding />)

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: mockArtistData.profile.name }
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: mockArtistData.profile.email }
    })
    fireEvent.click(screen.getByText(/next/i))

    // Verify error handling
    expect(await screen.findByText(/error occurred/i)).toBeInTheDocument()
    expect(screen.getByText(/try again/i)).toBeInTheDocument()
  })

  test('supports saving progress and resuming later', async () => {
    const { unmount } = render(<ArtistOnboarding />)

    // Fill partial information
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: mockArtistData.profile.name }
    })
    fireEvent.click(screen.getByText(/save progress/i))

    // Verify save
    expect(await screen.findByText(/progress saved/i)).toBeInTheDocument()

    // Unmount and remount to simulate page refresh
    unmount()
    render(<ArtistOnboarding />)

    // Verify data restored
    expect(screen.getByLabelText(/name/i)).toHaveValue(mockArtistData.profile.name)
  })
})
