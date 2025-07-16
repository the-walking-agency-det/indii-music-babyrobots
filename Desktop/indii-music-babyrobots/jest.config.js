module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {},
  transformIgnorePatterns: [
    '/node_modules/',
    '\\.pnp\\.[^/]+$',
  ],
};