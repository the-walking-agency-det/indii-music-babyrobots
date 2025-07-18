import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { TestDatabaseAdapter } from './test-db-adapter';
import { VectorStore } from '../../lib/memory/vector-store';
import { TreeRings } from '../../lib/memory/tree-rings';
import { resetUUIDCounter } from '../mocks/crypto';

interface TestContext {
  db: TestDatabaseAdapter;
  vectorStore: VectorStore;
  treeRings: TreeRings;
}

/**
 * Set up test environment with proper database handling
 */
export async function setupTestEnvironment(): Promise<TestContext> {
  const db = await TestDatabaseAdapter.getInstance();
  const context: TestContext = {
    db,
    vectorStore: new VectorStore({ adapter: db, namespace: 'test' }),
    treeRings: new TreeRings({ adapter: db })
  };

  // Before all tests in this file
  beforeAll(async () => {
    // Verify database connection
    const connected = await context.db.isConnected();
    if (!connected) {
      throw new Error(`Cannot connect to ${context.db.getDatabaseType()} database`);
    }
  });

  // After all tests in this file
  afterAll(async () => {
    await context.db.cleanup();
  });

  // Before each test
  beforeEach(async () => {
    resetUUIDCounter();
    await context.db.reset();
  });

  // After each test
  afterEach(async () => {
    // Additional cleanup if needed
  });

  return context;
}

/**
 * Test data factories
 */
export const testData = {
  /**
   * Create a memory for testing
   */
  createMemory: (content: string, level = 0, importance = 0.5) => ({
    content,
    level,
    importance,
    context: ['test'],
    createdAt: new Date(),
    updatedAt: new Date()
  }),

  /**
   * Create a document for testing
   */
  createDocument: (content: string, metadata = {}) => ({
    content,
    metadata: { type: 'test', ...metadata },
    embedding: Array(1536).fill(0), // Default OpenAI embedding size
    createdAt: new Date(),
    updatedAt: new Date()
  }),

  /**
   * Create a user for testing
   */
  createUser: (email: string, type = 'user') => ({
    email,
    type,
    createdAt: new Date(),
    updatedAt: new Date()
  }),

  /**
   * Create an agent for testing
   */
  createAgent: (name: string, metadata = {}) => ({
    name,
    metadata,
    lastActive: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  })
};

/**
 * Common test assertions
 */
export const assertions = {
  /**
   * Check if memory matches expected format
   */
  expectMemoryMatch: (actual: any, expected: any) => {
    expect(actual.content).toBe(expected.content);
    expect(actual.level).toBe(expected.level);
    expect(actual.importance).toBe(expected.importance);
    expect(actual.context).toEqual(expect.arrayContaining(expected.context));
    expect(actual.createdAt).toBeInstanceOf(Date);
    expect(actual.updatedAt).toBeInstanceOf(Date);
  },

  /**
   * Check if document matches expected format
   */
  expectDocumentMatch: (actual: any, expected: any) => {
    expect(actual.content).toBe(expected.content);
    expect(actual.metadata).toMatchObject(expected.metadata);
    expect(actual.embedding).toBeDefined();
    expect(actual.embedding.length).toBe(1536);
    expect(actual.createdAt).toBeInstanceOf(Date);
    expect(actual.updatedAt).toBeInstanceOf(Date);
  },

  /**
   * Check if query results are properly ordered
   */
  expectOrderedResults: (results: any[], field: string, order: 'asc' | 'desc' = 'desc') => {
    for (let i = 1; i < results.length; i++) {
      const prev = results[i-1][field];
      const curr = results[i][field];
      if (order === 'desc') {
        expect(prev).toBeGreaterThanOrEqual(curr);
      } else {
        expect(prev).toBeLessThanOrEqual(curr);
      }
    }
  }
};
