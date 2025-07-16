export const mockArtistData = {
  profile: {
    name: 'Test Artist',
    email: 'artist@test.com',
    genre: 'Electronic',
    socialLinks: {
      spotify: 'spotify:artist:123',
      instagram: '@testartist'
    }
  },
  documents: {
    w9Form: 'w9-test.pdf',
    contract: 'contract-test.pdf'
  },
  bankInfo: {
    routingNumber: '123456789',
    accountNumber: '********1234'
  }
}

export const mockRoyaltyData = {
  statement: {
    periodStart: '2025-01-01',
    periodEnd: '2025-03-31',
    earnings: [
      { platform: 'Spotify', amount: 1250.50, streams: 250000 },
      { platform: 'Apple Music', amount: 980.25, streams: 180000 },
      { platform: 'YouTube', amount: 450.75, views: 100000 }
    ],
    totalAmount: 2681.50
  },
  processing: {
    status: 'complete',
    errors: [],
    lastUpdated: '2025-04-15T10:30:00Z'
  }
}

export const mockPrintOrderData = {
  order: {
    id: 'PO-2025-001',
    type: 'emergency',
    items: [
      { sku: 'VINYL-001', quantity: 500, unitPrice: 12.99 },
      { sku: 'POSTER-001', quantity: 1000, unitPrice: 0.99 }
    ],
    shipping: {
      method: 'express',
      address: {
        street: '123 Music Ave',
        city: 'Nashville',
        state: 'TN',
        zip: '37203'
      }
    },
    status: 'pending'
  },
  inventory: {
    'VINYL-001': { available: 1000, allocated: 0 },
    'POSTER-001': { available: 2000, allocated: 0 }
  }
}
