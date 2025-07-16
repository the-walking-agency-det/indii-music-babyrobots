/** @type {import('jest').Config} */
const config = {
  displayName: 'Test Database Tests',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup-testdb.js'],
  testMatch: ['<rootDir>/src/**/*.testdb.{js,jsx,ts,tsx}'],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
};

module.exports = config;
