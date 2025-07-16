module.exports = {
  // Use in-memory SQLite for tests
  setupFiles: ['<rootDir>/../jest.memory.setup.js'],
  
  // Mock database and file system
  moduleNameMapper: {
    '^better-sqlite3$': '<rootDir>/__mocks__/better-sqlite3.js',
    '^fs$': '<rootDir>/__mocks__/fs.js'
  },

  // Test environment configuration
  testEnvironment: 'node',
  testTimeout: 10000,
  
  // Files to test
  testMatch: [
    '<rootDir>/indii/memory.test.js',
    '<rootDir>/indii/emotional.test.js'
  ],
  
  // Coverage collection
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage/memory',
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: [
    '<rootDir>/src/lib/memory/**/*.js',
    '<rootDir>/lib/agents/indii-agent.js'
  ],
  
  // Performance tracking
  verbose: true,
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: '<rootDir>/test-results/memory',
      outputName: 'results.xml',
    }]
  ]
};
