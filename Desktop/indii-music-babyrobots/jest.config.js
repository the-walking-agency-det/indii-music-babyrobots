module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\.(js|jsx|ts|tsx)$' : 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$' : '<rootDir>/$1',
    '^pages/(.*)$' : '<rootDir>/pages/$1',
    '^src/(.*)$' : '<rootDir>/src/$1',
    '^lib/(.*)$' : '<rootDir>/lib/$1',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@babel/runtime|@jest/globals)/)',
  ],
};