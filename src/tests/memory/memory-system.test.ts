import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { TestContextManager, TestContext } from '../utils/test-context';
import { MemoryManager } from '../../lib/memory/memory-manager';
import { VectorStore } from '../../lib/memory/vector-store';
import { TreeRings } from '../../lib/memory/tree-rings';

describe('Memory System Integration', () => {
  let manager: TestContextManager;
  let context: TestContext;
  let memoryManager: MemoryManager;
  let vectorStore: VectorStore;
  let treeRings: TreeRings;

  beforeEach(async () => {
    // Initialize test context with all database types for comprehensive testing
    manager = new TestContextManager();
    await manager.init({
      useSQLite: true,    // For quick local tests
      usePrisma: true,    // For integration tests
      useSupabase: true   // For end-to-end tests
    });
    context = manager.getContext();

    // Start a transaction for test isolation
    await manager.startTransaction();

    // Initialize memory system components
    vectorStore = new VectorStore({
      client: context.prisma,  // Use Prisma for integration tests
      namespace: 'test'
    });

    treeRings = new TreeRings({
      client: context.sqlite,  // Use SQLite for quick local tests
      timeWindow: 24 * 60 * 60 * 1000  // 24 hours
    });

    memoryManager = new MemoryManager({
      vectorStore,
      treeRings,
      realtime: context.supabase  // Use Supabase for realtime updates
    });
  });

  afterEach(async () => {
    await manager.cleanup();
  });

  describe('Memory Creation and Retrieval', () => {
    it('should create and retrieve memories with proper context', async () => {
      // Create test memories
      const memory1 = await manager.createTestData('createMemory',
        'Meeting about project roadmap',
        1,
        0.8,
        ['meeting', 'roadmap']
      );

      const memory2 = await manager.createTestData('createMemory',
        'Technical discussion about database architecture',
        2,
        0.9,
        ['technical', 'database']
      );

      // Store memories
      await memoryManager.store(memory1);
      await memoryManager.store(memory2);

      // Verify vector storage
      const similar = await vectorStore.search(
        'project planning meeting',
        { limit: 1 }
      );
      expect(similar[0].id).toBe(memory1.id);

      // Verify temporal storage
      const recent = await treeRings.getRecent(1);
      expect(recent[0].id).toBe(memory2.id);

      // Advance time and add another memory
      context.advanceTime(12 * 60 * 60 * 1000); // 12 hours

      const memory3 = await manager.createTestData('createMemory',
        'Follow-up on database implementation',
        2,
        0.7,
        ['technical', 'database', 'follow-up']
      );
      await memoryManager.store(memory3);

      // Verify temporal context
      const timeWindow = await treeRings.getTimeWindow(
        new Date(context.now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
        context.now
      );
      expect(timeWindow).toHaveLength(1);
      expect(timeWindow[0].id).toBe(memory3.id);
    });

    it('should handle memory importance and context correlation', async () => {
      // Create a sequence of related memories
      const memories = await Promise.all([
        manager.createTestData('createMemory',
          'Initial project kickoff',
          1,
          0.8,
          ['project', 'kickoff']
        ),
        manager.createTestData('createMemory',
          'Team allocation discussion',
          1,
          0.7,
          ['project', 'team']
        ),
        manager.createTestData('createMemory',
          'Technical architecture planning',
          2,
          0.9,
          ['project', 'architecture']
        )
      ]);

      // Store memories with time progression
      for (const memory of memories) {
        await memoryManager.store(memory);
        context.advanceTime(2 * 60 * 60 * 1000); // 2 hours between memories
      }

      // Query with context
      const relevant = await memoryManager.recall({
        query: 'project planning',
        context: ['project'],
        timeRange: {
          start: new Date(context.now.getTime() - 8 * 60 * 60 * 1000),
          end: context.now
        }
      });

      // Verify results combine semantic and temporal relevance
      expect(relevant).toHaveLength(3);
      expect(relevant[0].id).toBe(memories[2].id); // Most recent and important
      expect(relevant[1].id).toBe(memories[0].id); // Most relevant to query
      expect(relevant[2].id).toBe(memories[1].id); // Less relevant but in time range
    });
  });

  describe('Memory Update and Decay', () => {
    it('should update memory importance based on access patterns', async () => {
      // Create and store a memory
      const memory = await manager.createTestData('createMemory',
        'Important technical decision',
        1,
        0.5, // Start with medium importance
        ['technical', 'decision']
      );
      await memoryManager.store(memory);

      // Simulate multiple accesses over time
      for (let i = 0; i < 3; i++) {
        context.advanceTime(4 * 60 * 60 * 1000); // 4 hours between accesses
        await memoryManager.access(memory.id!);
      }

      // Verify importance increased
      const updated = await memoryManager.get(memory.id!);
      expect(updated.importance).toBeGreaterThan(memory.importance);

      // Simulate time passing without access
      context.advanceTime(7 * 24 * 60 * 60 * 1000); // 7 days

      // Verify importance decay
      const decayed = await memoryManager.get(memory.id!);
      expect(decayed.importance).toBeLessThan(updated.importance);
    });

    it('should handle realtime updates across instances', async () => {
      // Skip if Supabase client not available
      if (!context.supabase) {
        return;
      }

      // Create two memory manager instances
      const manager2 = new MemoryManager({
        vectorStore,
        treeRings,
        realtime: context.supabase
      });

      // Create test memory
      const memory = await manager.createTestData('createMemory',
        'Shared technical note',
        1,
        0.6,
        ['technical', 'shared']
      );

      // Setup update tracking
      const updates: any[] = [];
      manager2.subscribe(memory.id!, (update) => {
        updates.push(update);
      });

      // Store and update memory from first instance
      await memoryManager.store(memory);
      await memoryManager.update(memory.id!, {
        importance: 0.8,
        context: [...memory.context, 'updated']
      });

      // Wait for realtime update
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify updates were received
      expect(updates).toHaveLength(2); // Initial store + update
      expect(updates[1].importance).toBe(0.8);
      expect(updates[1].context).toContain('updated');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle database failures gracefully', async () => {
      // Create test memory
      const memory = await manager.createTestData('createMemory',
        'Test memory',
        1,
        0.5,
        ['test']
      );

      // Force transaction rollback to simulate failure
      await manager.rollbackTransaction();

      // Verify operations fail gracefully
      await expect(memoryManager.store(memory))
        .rejects.toThrow(/transaction/i);

      // Restart transaction for cleanup
      await manager.startTransaction();
    });

    it('should handle concurrent operations correctly', async () => {
      // Create test memory
      const memory = await manager.createTestData('createMemory',
        'Concurrent test memory',
        1,
        0.5,
        ['test']
      );

      // Simulate concurrent updates
      const updates = await Promise.allSettled([
        memoryManager.update(memory.id!, { importance: 0.6 }),
        memoryManager.update(memory.id!, { importance: 0.7 }),
        memoryManager.update(memory.id!, { importance: 0.8 })
      ]);

      // Verify only one update succeeded
      const successful = updates.filter(r => r.status === 'fulfilled');
      expect(successful).toHaveLength(1);

      // Verify final state is consistent
      const final = await memoryManager.get(memory.id!);
      expect(final.importance).toBe(0.8);
    });
  });
});
