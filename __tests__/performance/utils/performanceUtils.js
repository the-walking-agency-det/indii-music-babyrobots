// Performance testing utilities
export const measureExecutionTime = async (callback) => {
  const start = performance.now()
  await callback()
  const end = performance.now()
  return end - start
}

export const generateLargeDataset = (size) => {
  const dataset = []
  for (let i = 0; i < size; i++) {
    dataset.push({
      id: `ARTIST-${i}`,
      name: `Artist ${i}`,
      earnings: Math.random() * 10000,
      streams: Math.floor(Math.random() * 1000000),
      lastUpdated: new Date().toISOString()
    })
  }
  return dataset
}

export const simulateUserLoad = async (userCount, action) => {
  const users = Array(userCount).fill(null)
  const results = await Promise.all(
    users.map((_, index) => action(`user-${index}`))
  )
  return results
}

export const PERFORMANCE_THRESHOLDS = {
  apiResponse: 200, // ms
  batchProcessing: 5000, // ms
  uiInteraction: 100, // ms
  concurrentUsers: 50
}
