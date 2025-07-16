import { render, screen, fireEvent } from '@testing-library/react'
import { 
  measureExecutionTime, 
  generateLargeDataset,
  simulateUserLoad,
  PERFORMANCE_THRESHOLDS 
} from './utils/performanceUtils'
import { apiService } from '../__mocks__/apiService'
import RoyaltyProcessing from '../../workflows/RoyaltyProcessing'
import PrintOrder from '../../workflows/PrintOrder'

jest.mock('../../services/apiService', () => apiService)

describe('Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Large Dataset Processing', () => {
    test('processes large royalty batch within timeout', async () => {
      const largeDataset = generateLargeDataset(10000) // 10k records
      
      const processingTime = await measureExecutionTime(async () => {
        render(<RoyaltyProcessing />)
        
        // Simulate file upload with large dataset
        const fileInput = screen.getByLabelText(/upload statement/i)
        const file = new File(
          [JSON.stringify(largeDataset)],
          'large-royalties.json',
          { type: 'application/json' }
        )
        Object.defineProperty(fileInput, 'files', { value: [file] })
        fireEvent.change(fileInput)

        // Wait for processing
        await screen.findByText(/processing complete/i)
      })

      expect(processingTime).toBeLessThan(PERFORMANCE_THRESHOLDS.batchProcessing)
    })

    test('handles concurrent print orders efficiently', async () => {
      const processingTime = await measureExecutionTime(async () => {
        // Simulate multiple concurrent orders
        await simulateUserLoad(PERFORMANCE_THRESHOLDS.concurrentUsers, async (userId) => {
          render(<PrintOrder />)
          
          // Fill order details
          fireEvent.change(screen.getByLabelText(/quantity/i), {
            target: { value: '100' }
          })
          fireEvent.click(screen.getByText(/submit/i))
          
          await screen.findByText(/order confirmed/i)
        })
      })

      const averageTimePerUser = processingTime / PERFORMANCE_THRESHOLDS.concurrentUsers
      expect(averageTimePerUser).toBeLessThan(PERFORMANCE_THRESHOLDS.apiResponse)
    })
  })

  describe('Response Time Tests', () => {
    test('API endpoints respond within threshold', async () => {
      const endpoints = [
        apiService.artist.getProfile,
        apiService.royalty.getHistory,
        apiService.printOrder.checkInventory
      ]

      for (const endpoint of endpoints) {
        const responseTime = await measureExecutionTime(async () => {
          await endpoint()
        })

        expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.apiResponse)
      }
    })

    test('UI interactions are responsive', async () => {
      render(<RoyaltyProcessing />)

      const interactionTime = await measureExecutionTime(async () => {
        // Test dropdown open/close
        fireEvent.click(screen.getByText(/filter period/i))
        await screen.findByText(/last 30 days/i)

        // Test table sorting
        fireEvent.click(screen.getByText(/earnings/i))
        await screen.findByText(/sorted by earnings/i)
      })

      expect(interactionTime).toBeLessThan(PERFORMANCE_THRESHOLDS.uiInteraction)
    })
  })

  describe('Load Testing', () => {
    test('handles peak user traffic', async () => {
      const peakUserCount = PERFORMANCE_THRESHOLDS.concurrentUsers * 2
      let failedRequests = 0

      await simulateUserLoad(peakUserCount, async (userId) => {
        try {
          await apiService.artist.getProfile()
        } catch {
          failedRequests++
        }
      })

      // Allow for some degradation but ensure most requests succeed
      expect(failedRequests / peakUserCount).toBeLessThan(0.1) // Less than 10% failure rate
    })

    test('maintains performance under sustained load', async () => {
      const testDuration = 5000 // 5 seconds
      const start = Date.now()
      let requestCount = 0
      let totalResponseTime = 0

      while (Date.now() - start < testDuration) {
        const responseTime = await measureExecutionTime(async () => {
          await apiService.royalty.getHistory()
        })
        totalResponseTime += responseTime
        requestCount++
      }

      const averageResponseTime = totalResponseTime / requestCount
      expect(averageResponseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.apiResponse)
    })
  })
})
