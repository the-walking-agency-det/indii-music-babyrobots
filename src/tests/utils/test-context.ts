import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { SQLiteConnection } from './sqlite-setup';
import { mockCrypto } from '../mocks/crypto';
import { testData } from './test-data';

export interface TestContext {
  // Database clients
  prisma?: PrismaClient;
  supabase?: ReturnType<typeof createClient<Database>>;
  sqlite?: SQLiteConnection;
  
  // Test state
  memories: Map<string, typeof testData.createMemory>;
  documents: Map<string, typeof testData.createDocument>;
  agents: Map<string, typeof testData.createAgent>;
  tasks: Map<string, typeof testData.createTask>;
  
  // Transaction state
  transactionId?: string;
  
  // Timing utilities
  now: Date;
  advanceTime: (ms: number) => void;
  
  // Cleanup tracking
  cleanupFns: Array<() => Promise<void>>;
}

export class TestContextManager {
  private context: TestContext;
  private mockDate: Date;

  constructor() {
    this.mockDate = new Date(2025, 0, 1);
    this.context = {
      memories: new Map(),
      documents: new Map(),
      agents: new Map(),
      tasks: new Map(),
      now: this.mockDate,
      advanceTime: this.advanceTime.bind(this),
      cleanupFns: []
    };
  }

  /**
   * Initialize test context with specified database connections
   */
  async init(options: {
    usePrisma?: boolean;
    useSupabase?: boolean;
    useSQLite?: boolean;
  } = {}) {
    // Setup database connections based on options
    if (options.usePrisma) {
      const { setupPrismaTestDb } = await import('./prisma-setup');
      const prisma = await setupPrismaTestDb();
      this.context.prisma = prisma;
      this.context.cleanupFns.push(async () => {
        await prisma.$disconnect();
      });
    }

    if (options.useSupabase) {
      const { setupSupabaseTestDb } = await import('./supabase-setup');
      const supabase = await setupSupabaseTestDb();
      this.context.supabase = supabase;
      // Supabase cleanup happens automatically
    }

    if (options.useSQLite) {
      const { setupSQLite } = await import('./sqlite-setup');
      const sqlite = await setupSQLite();
      this.context.sqlite = sqlite;
      this.context.cleanupFns.push(async () => {
        await sqlite.close();
      });
    }

    // Set up time mocking
    vi.useFakeTimers();
    vi.setSystemTime(this.mockDate);
  }

  /**
   * Create test data with automatic cleanup tracking
   */
  async createTestData<T extends keyof typeof testData>(
    type: T,
    ...args: Parameters<typeof testData[T]>
  ): Promise<ReturnType<typeof testData[T]>> {
    const data = testData[type](...args);
    this.context[`${type}s`].set(data.id!, data);
    return data;
  }

  /**
   * Start a new transaction for test isolation
   */
  async startTransaction() {
    const txId = mockCrypto.randomUUID();
    
    if (this.context.prisma) {
      await this.context.prisma.$transaction(async (tx) => {
        // Store transaction client for use in test
        this.context.prisma = tx as any;
      });
    }

    if (this.context.sqlite) {
      await this.context.sqlite.run('BEGIN TRANSACTION');
    }

    // Supabase doesn't support transactions in the client
    
    this.context.transactionId = txId;
  }

  /**
   * Roll back the current transaction
   */
  async rollbackTransaction() {
    if (!this.context.transactionId) {
      throw new Error('No transaction in progress');
    }

    if (this.context.prisma) {
      await this.context.prisma.$transaction.rollback();
    }

    if (this.context.sqlite) {
      await this.context.sqlite.run('ROLLBACK');
    }

    delete this.context.transactionId;
  }

  /**
   * Advance the mock time
   */
  private advanceTime(ms: number) {
    this.mockDate = new Date(this.mockDate.getTime() + ms);
    this.context.now = this.mockDate;
    vi.setSystemTime(this.mockDate);
  }

  /**
   * Clean up test resources
   */
  async cleanup() {
    // Roll back any open transaction
    if (this.context.transactionId) {
      await this.rollbackTransaction();
    }

    // Run all cleanup functions
    for (const fn of this.context.cleanupFns) {
      await fn();
    }

    // Clear test data
    this.context.memories.clear();
    this.context.documents.clear();
    this.context.agents.clear();
    this.context.tasks.clear();

    // Reset time mocking
    vi.useRealTimers();
  }

  /**
   * Get the current test context
   */
  getContext(): TestContext {
    return this.context;
  }
}

// Helper for creating an isolated test context
export async function createTestContext(options?: Parameters<TestContextManager['init']>[0]): Promise<TestContext> {
  const manager = new TestContextManager();
  await manager.init(options);
  return manager.getContext();
}

// Example usage in tests:
if (process.env.NODE_ENV === 'test') {
  describe('TestContextManager', () => {
    let manager: TestContextManager;
    let context: TestContext;

    beforeEach(async () => {
      manager = new TestContextManager();
      await manager.init({ useSQLite: true });
      context = manager.getContext();
    });

    afterEach(async () => {
      await manager.cleanup();
    });

    it('should manage test data lifecycle', async () => {
      // Create test data
      const memory = await manager.createTestData('createMemory', 'test content');
      const doc = await manager.createTestData('createDocument', 'test doc');
      
      // Verify data is tracked
      expect(context.memories.get(memory.id!)).toBe(memory);
      expect(context.documents.get(doc.id!)).toBe(doc);
      
      // Cleanup should clear data
      await manager.cleanup();
      expect(context.memories.size).toBe(0);
      expect(context.documents.size).toBe(0);
    });

    it('should support transaction isolation', async () => {
      await manager.startTransaction();
      
      // Create test data in transaction
      await context.sqlite!.run(
        'CREATE TABLE IF NOT EXISTS test (id TEXT PRIMARY KEY, content TEXT)'
      );
      await context.sqlite!.run(
        'INSERT INTO test (id, content) VALUES (?, ?)',
        ['test1', 'content1']
      );
      
      // Roll back transaction
      await manager.rollbackTransaction();
      
      // Verify data was rolled back
      const result = await context.sqlite!.get(
        'SELECT * FROM test WHERE id = ?',
        ['test1']
      );
      expect(result).toBeUndefined();
    });

    it('should manage time correctly', () => {
      const initialTime = context.now.getTime();
      
      // Advance time
      context.advanceTime(1000); // 1 second
      
      // Verify time was advanced
      expect(context.now.getTime()).toBe(initialTime + 1000);
      expect(Date.now()).toBe(initialTime + 1000);
    });
  });
}
