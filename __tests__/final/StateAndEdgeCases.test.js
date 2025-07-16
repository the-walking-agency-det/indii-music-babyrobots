import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { mockArtistData } from '../__fixtures__/mockData'
import { apiService } from '../__mocks__/apiService'
import { WorkflowProvider } from '../../contexts/WorkflowContext'
import ArtistWorkflow from '../../workflows/ArtistWorkflow'

jest.mock('../../services/apiService', () => apiService)

describe('State Management & Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('Session Persistence', () => {
    test('retains form data across page navigation', async () => {
      const { unmount } = render(
        <WorkflowProvider>
          <ArtistWorkflow />
        </WorkflowProvider>
      )

      // Fill form data
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: mockArtistData.profile.name }
      })
      
      // Simulate page navigation
      unmount()
      
      // Return to form
      render(
        <WorkflowProvider>
          <ArtistWorkflow />
        </WorkflowProvider>
      )

      // Verify data persistence
      expect(screen.getByLabelText(/name/i)).toHaveValue(mockArtistData.profile.name)
    })

    test('recovers from session timeout', async () => {
      render(
        <WorkflowProvider>
          <ArtistWorkflow />
        </WorkflowProvider>
      )

      // Simulate session timeout
      await act(async () => {
        await apiService.auth.sessionExpired()
      })

      // Verify graceful handling
      expect(screen.getByText(/session expired/i)).toBeInTheDocument()
      expect(screen.getByText(/resume/i)).toBeInTheDocument()

      // Test session recovery
      fireEvent.click(screen.getByText(/resume/i))
      expect(await screen.findByText(/session restored/i)).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    test('handles network timeouts gracefully', async () => {
      // Mock slow network
      apiService.artist.update.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(resolve, 5000))
      )

      render(
        <WorkflowProvider>
          <ArtistWorkflow />
        </WorkflowProvider>
      )

      fireEvent.click(screen.getByText(/save/i))

      // Verify timeout handling
      expect(await screen.findByText(/taking longer than usual/i)).toBeInTheDocument()
      expect(screen.getByText(/retry/i)).toBeInTheDocument()
    })

    test('prevents concurrent form submissions', async () => {
      render(
        <WorkflowProvider>
          <ArtistWorkflow />
        </WorkflowProvider>
      )

      // Attempt multiple rapid submissions
      const submitButton = screen.getByText(/submit/i)
      fireEvent.click(submitButton)
      fireEvent.click(submitButton)
      fireEvent.click(submitButton)

      // Verify only one submission processed
      await waitFor(() => {
        expect(apiService.artist.update).toHaveBeenCalledTimes(1)
      })
    })

    test('recovers from partial workflow completion', async () => {
      // Mock interrupted workflow
      localStorage.setItem('workflowState', JSON.stringify({
        step: 2,
        data: { name: mockArtistData.profile.name }
      }))

      render(
        <WorkflowProvider>
          <ArtistWorkflow />
        </WorkflowProvider>
      )

      // Verify state recovery
      expect(screen.getByText(/resume from step 2/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/name/i)).toHaveValue(mockArtistData.profile.name)

      // Complete workflow
      fireEvent.click(screen.getByText(/continue/i))
      expect(await screen.findByText(/workflow complete/i)).toBeInTheDocument()
    })
  })

  describe('Data Synchronization', () => {
    test('handles real-time updates', async () => {
      render(
        <WorkflowProvider>
          <ArtistWorkflow />
        </WorkflowProvider>
      )

      // Simulate real-time update
      act(() => {
        apiService.emitUpdate({
          type: 'ROYALTY_UPDATE',
          data: { amount: 1500 }
        })
      })

      // Verify UI updates
      expect(await screen.findByText(/\$1,500/)).toBeInTheDocument()
    })

    test('resolves data conflicts', async () => {
      render(
        <WorkflowProvider>
          <ArtistWorkflow />
        </WorkflowProvider>
      )

      // Simulate concurrent updates
      const updates = [
        { version: 1, data: { name: 'Update 1' } },
        { version: 2, data: { name: 'Update 2' } }
      ]

      // Apply updates out of order
      act(() => {
        apiService.emitUpdate(updates[1])
        apiService.emitUpdate(updates[0])
      })

      // Verify correct version displayed
      expect(screen.getByLabelText(/name/i)).toHaveValue('Update 2')
    })
  })
})
