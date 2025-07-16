import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { mockArtistData } from '../__fixtures__/mockData'
import { apiService } from '../__mocks__/apiService'
import { NotificationProvider } from '../../contexts/NotificationContext'
import { NotificationSystem } from '../../components/notifications'

jest.mock('../../services/apiService', () => apiService)

describe('Notification System', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('Event Triggers', () => {
    test('triggers notifications for workflow stages', async () => {
      render(
        <NotificationProvider>
          <NotificationSystem />
        </NotificationProvider>
      )

      // Simulate workflow progress
      act(() => {
        apiService.notifications.emit('ONBOARDING_STARTED', {
          artistId: 'ARTIST-123',
          stage: 'initial'
        })
      })

      // Verify notification
      expect(await screen.findByText(/onboarding started/i)).toBeInTheDocument()

      // Progress to next stage
      act(() => {
        apiService.notifications.emit('DOCUMENTS_UPLOADED', {
          artistId: 'ARTIST-123',
          stage: 'documents'
        })
      })

      expect(await screen.findByText(/documents received/i)).toBeInTheDocument()
    })

    test('handles multiple notification types', async () => {
      render(
        <NotificationProvider>
          <NotificationSystem />
        </NotificationProvider>
      )

      // Simulate various notifications
      act(() => {
        apiService.notifications.emit('ROYALTY_PAYMENT', {
          amount: 1500,
          currency: 'USD'
        })
        apiService.notifications.emit('PRINT_ORDER_SHIPPED', {
          orderId: 'ORDER-456',
          tracking: 'TRACK-789'
        })
      })

      // Verify all notifications appear
      expect(await screen.findByText(/payment received/i)).toBeInTheDocument()
      expect(screen.getByText(/order shipped/i)).toBeInTheDocument()
    })
  })

  describe('Delivery Confirmation', () => {
    test('confirms notification delivery', async () => {
      render(
        <NotificationProvider>
          <NotificationSystem />
        </NotificationProvider>
      )

      const notificationId = 'NOTIF-123'
      
      // Send notification
      act(() => {
        apiService.notifications.emit('IMPORTANT_UPDATE', {
          id: notificationId,
          message: 'Critical update'
        })
      })

      // Verify delivery confirmation
      await waitFor(() => {
        expect(apiService.notifications.confirm).toHaveBeenCalledWith(
          notificationId
        )
      })
    })

    test('tracks user interaction with notifications', async () => {
      render(
        <NotificationProvider>
          <NotificationSystem />
        </NotificationProvider>
      )

      // Emit notification
      act(() => {
        apiService.notifications.emit('ACTION_REQUIRED', {
          id: 'NOTIF-456',
          message: 'Action needed'
        })
      })

      // Click notification
      fireEvent.click(await screen.findByText(/action needed/i))

      // Verify interaction tracked
      expect(apiService.notifications.track).toHaveBeenCalledWith(
        'NOTIF-456',
        'CLICKED'
      )
    })
  })

  describe('Failure Handling & Retries', () => {
    test('handles failed notification delivery', async () => {
      // Mock failed delivery
      apiService.notifications.send.mockRejectedValueOnce(
        new Error('Network error')
      )

      render(
        <NotificationProvider>
          <NotificationSystem />
        </NotificationProvider>
      )

      // Attempt notification
      act(() => {
        apiService.notifications.emit('SYSTEM_ALERT', {
          id: 'NOTIF-789',
          message: 'Important alert'
        })
      })

      // Verify retry mechanism
      expect(await screen.findByText(/retrying delivery/i)).toBeInTheDocument()
      
      // Should attempt retry
      await waitFor(() => {
        expect(apiService.notifications.send).toHaveBeenCalledTimes(2)
      })
    })

    test('implements exponential backoff for retries', async () => {
      jest.useFakeTimers()

      // Mock multiple failures
      apiService.notifications.send
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValueOnce({ success: true })

      render(
        <NotificationProvider>
          <NotificationSystem />
        </NotificationProvider>
      )

      // Trigger notification
      act(() => {
        apiService.notifications.emit('RETRY_TEST', {
          id: 'NOTIF-retry',
          message: 'Testing retries'
        })
      })

      // First retry after 1 second
      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(apiService.notifications.send).toHaveBeenCalledTimes(2)

      // Second retry after 2 more seconds
      act(() => {
        jest.advanceTimersByTime(2000)
      })
      expect(apiService.notifications.send).toHaveBeenCalledTimes(3)

      // Verify success message
      expect(await screen.findByText(/delivery successful/i)).toBeInTheDocument()

      jest.useRealTimers()
    })

    test('stores failed notifications for later retry', async () => {
      // Mock offline status
      window.navigator.onLine = false

      render(
        <NotificationProvider>
          <NotificationSystem />
        </NotificationProvider>
      )

      // Queue notification while offline
      act(() => {
        apiService.notifications.emit('OFFLINE_NOTIFICATION', {
          id: 'NOTIF-offline',
          message: 'Test offline handling'
        })
      })

      // Verify stored for later
      expect(await screen.findByText(/queued for delivery/i)).toBeInTheDocument()

      // Simulate coming online
      window.navigator.onLine = true
      window.dispatchEvent(new Event('online'))

      // Should attempt delivery
      await waitFor(() => {
        expect(apiService.notifications.send).toHaveBeenCalled()
      })
    })
  })
})
