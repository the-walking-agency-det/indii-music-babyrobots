import { beforeAll, afterAll, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { TestDatabaseAdapter } from './utils/test-db-adapter';
import { mockCrypto } from './mocks/crypto';

let db: TestDatabaseAdapter;

beforeAll(async () => {
  db = await TestDatabaseAdapter.getInstance();

  // Verify database connection
  const connected = await db.isConnected();
  if (!connected) {
    throw new Error(`Cannot connect to ${db.getDatabaseType()} database`);
  }
});

beforeEach(async () => {
  mockCrypto.resetUUIDCounter();
  await db.reset(); // Clear all test data
});

afterAll(async () => {
  await db.cleanup(); // Close connections
});

export { db as testDb };
