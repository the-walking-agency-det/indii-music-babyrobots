import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

// Mock window.confirm
global.confirm = jest.fn();

// Mock fs for db.test.js
jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
}));

// Mock the useToast hook
jest.mock('./src/components/ui/Toast', () => ({
  useToast: jest.fn(() => jest.fn()),
}));

jest.mock('better-sqlite3', () => {
  const Database = jest.fn(() => ({
    prepare: jest.fn(() => ({
      run: jest.fn(),
      all: jest.fn(() => []), // Mock empty array for queries
      get: jest.fn(() => undefined), // Mock undefined for single results
    })),
    transaction: jest.fn((fn) => fn()),
    close: jest.fn(),
  }));
  return Database;
});

jest.mock('sqlite3', () => ({
  verbose: jest.fn(),
  Database: jest.fn(() => ({
    run: jest.fn(),
    get: jest.fn((sql, params, callback) => {
      if (callback) callback(null, {});
    }),
    all: jest.fn((sql, params, callback) => {
      if (callback) callback(null, []);
    }),
    close: jest.fn(),
  })),
}));