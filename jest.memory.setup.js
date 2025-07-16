const fs = require('fs');
const path = require('path');

// Mock test data
const mockFiles = {
  '/test/conversation.json': JSON.stringify({
    id: 'test-convo',
    messages: []
  }),
  '/test/artist.json': JSON.stringify({
    id: 'test-artist',
    name: 'Test Artist'
  })
};

// Set up file system mocks
require('./__mocks__/fs').__setMockFiles(mockFiles);

// SQLite memory configuration
process.env.DB_MEMORY = 'true';
process.env.DB_PATH = ':memory:';

// Test data setup
global.testData = {
  sessionId: 'test-session-123',
  artistId: 'test-artist-456',
  timestamp: new Date('2025-07-15T10:00:00Z').getTime()
};

// Cleanup between tests
afterEach(() => {
  jest.clearAllMocks();
});
