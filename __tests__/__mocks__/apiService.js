// Mock API Service
export const apiService = {
  artist: {
    create: jest.fn().mockResolvedValue({ success: true, id: 'ARTIST-001' }),
    update: jest.fn().mockResolvedValue({ success: true }),
    uploadDocument: jest.fn().mockResolvedValue({ success: true, url: 'https://example.com/doc' }),
    verifyBankInfo: jest.fn().mockResolvedValue({ verified: true })
  },
  royalty: {
    processStatement: jest.fn().mockResolvedValue({ 
      success: true, 
      statementId: 'ROYALTY-2025-Q1' 
    }),
    generateReport: jest.fn().mockResolvedValue({ 
      success: true, 
      reportUrl: 'https://example.com/report.pdf' 
    }),
    notify: jest.fn().mockResolvedValue({ sent: true })
  },
  printOrder: {
    create: jest.fn().mockResolvedValue({ 
      success: true, 
      orderId: 'PO-2025-001' 
    }),
    checkInventory: jest.fn().mockResolvedValue({ 
      available: true, 
      stock: { 'VINYL-001': 1000, 'POSTER-001': 2000 } 
    }),
    dispatch: jest.fn().mockResolvedValue({ 
      dispatched: true, 
      trackingId: 'TRACK-001' 
    })
  }
}
