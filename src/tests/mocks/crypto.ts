import { vi } from 'vitest';

let uuidCounter = 0;

/**
 * Creates a deterministic UUID for testing
 * Format: test-uuid-00001, test-uuid-00002, etc.
 */
export function mockRandomUUID(): string {
  uuidCounter++;
  return `test-uuid-${uuidCounter.toString().padStart(5, '0')}`;
}

/**
 * Reset the UUID counter (call this in beforeEach)
 */
export function resetUUIDCounter(): void {
  uuidCounter = 0;
}

/**
 * Mock crypto module
 */
export const mockCrypto = {
  randomUUID: vi.fn().mockImplementation(mockRandomUUID),
  resetUUIDCounter: vi.fn().mockImplementation(resetUUIDCounter)
} as const;

// Export type to ensure mock matches real crypto module
export type MockCrypto = typeof mockCrypto;
