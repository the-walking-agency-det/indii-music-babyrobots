import { beforeEach, afterEach, vi } from 'vitest';
import { MockPrismaClient } from '../mocks/prisma';
import { VectorStore } from '../../lib/knowledge/vector-store';
import { resetUUIDCounter } from '../mocks/crypto';

interface TestContext {
  prisma: MockPrismaClient;
  vectorStore?: VectorStore;
}

/**
 * Sets up a clean test environment with mocked dependencies
 */
export function setupTestEnvironment(): TestContext {
  const context: TestContext = {
    prisma: new MockPrismaClient()
  };

  beforeEach(() => {
    // Reset mocks and counters
    resetUUIDCounter();
    context.prisma.clear();
    vi.clearAllMocks();

    // Reset singletons if needed
    if (context.vectorStore) {
      VectorStore.tearDown();
      context.vectorStore = VectorStore.getInstance();
    }
  });

  afterEach(() => {
    context.prisma.clear();
  });

  return context;
}

/**
 * Creates test data factories for common entities
 */
export const testData = {
  createDocument: (content: string, metadata = {}) => ({
    content,
    metadata: { type: 'test', ...metadata },
    embedding: Array(1536).fill(0) // Default OpenAI embedding size
  }),

  createMemory: (content: string, level = 0, importance = 0.5) => ({
    content,
    level,
    importance,
    context: ['test'],
    createdAt: new Date(),
    updatedAt: new Date()
  })
};

/**
 * Assertion helpers for common test patterns
 */
export const assertions = {
  expectDocumentMatch: (actual: any, expected: any) => {
    expect(actual.content).toBe(expected.content);
    expect(actual.metadata).toMatchObject(expected.metadata);
    expect(actual.embedding).toBeDefined();
  },

  expectSearchResults: (results: any[], query: string, limit?: number) => {
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    if (limit) {
      expect(results.length).toBeLessThanOrEqual(limit);
    }
    // Verify results are ordered by score
    for (let i = 1; i < results.length; i++) {
      expect(results[i-1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  }
};
