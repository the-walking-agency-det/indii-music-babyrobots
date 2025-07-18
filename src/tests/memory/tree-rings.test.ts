import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { TreeRingsMemory } from '../../lib/memory/tree-rings';
import { TestDatabaseAdapter } from '../utils/test-db-adapter';
import { setupTestEnvironment } from '../utils/test-env';

describe('TreeRingsMemory Tests', () => {
  const { db } = setupTestEnvironment();
  let memory: TreeRingsMemory;

  beforeEach(async () => {
    await db.reset();
    memory = new TreeRingsMemory({
      adapter: db
    });
  });

  describe('Memory Storage', () => {
    it('should store memories with correct ring levels', async () => {
      const highImportance = await memory.store(
        { type: 'critical', data: 'Important memory' },
        ['critical', 'core'],
        0.9
      );
      expect(highImportance.level).toBe(0); // Core ring

      const mediumImportance = await memory.store(
        { type: 'normal', data: 'Regular memory' },
        ['normal'],
        0.5
      );
      expect(mediumImportance.level).toBe(2); // Middle ring

      const lowImportance = await memory.store(
        { type: 'trivial', data: 'Less important memory' },
        ['trivial'],
        0.1
      );
      expect(lowImportance.level).toBe(4); // Outer ring
    });

    it('should link related memories', async () => {
      const memory1 = await memory.store(
        { data: 'First memory' },
        ['test'],
        0.5
      );

      const memory2 = await memory.store(
        { data: 'Related memory' },
        ['test'],
        0.5
      );

      await memory.link(memory1.id, [memory2.id]);

      const updated = await prisma.memory.findUnique({
        where: { id: memory1.id }
      });

      expect(updated?.references).toContain(memory2.id);
    });
  });

  describe('Memory Retrieval', () => {
    it('should query memories by context', async () => {
      await memory.store(
        { data: 'Memory 1' },
        ['test', 'group1'],
        0.5
      );

      await memory.store(
        { data: 'Memory 2' },
        ['test', 'group2'],
        0.5
      );

      const results = await memory.query({
        context: ['group1']
      });

      expect(results.length).toBe(1);
      expect(results[0].content.data).toBe('Memory 1');
    });

    it('should query memories by time range', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      await memory.store(
        { data: 'Recent memory' },
        ['test'],
        0.5
      );

      const results = await memory.query({
        timeRange: {
          start: yesterday,
          end: now
        }
      });

      expect(results.length).toBe(1);
      expect(results[0].content.data).toBe('Recent memory');

      const oldResults = await memory.query({
        timeRange: {
          start: lastWeek,
          end: yesterday
        }
      });

      expect(oldResults.length).toBe(0);
    });

    it('should query memories by importance', async () => {
      await memory.store(
        { data: 'Important memory' },
        ['test'],
        0.9
      );

      await memory.store(
        { data: 'Less important memory' },
        ['test'],
        0.3
      );

      const importantResults = await memory.query({
        importance: 0.8
      });

      expect(importantResults.length).toBe(1);
      expect(importantResults[0].content.data).toBe('Important memory');
    });
  });

  describe('Memory Management', () => {
    it('should update existing memories', async () => {
      const original = await memory.store(
        { data: 'Original content' },
        ['test'],
        0.5
      );

      const updated = await memory.update(original.id, {
        content: { data: 'Updated content' },
        importance: 0.8
      });

      expect(updated.content.data).toBe('Updated content');
      expect(updated.importance).toBe(0.8);
    });

    it('should prune old memories based on importance and access', async () => {
      // Create several memories with varying importance
      for (let i = 0; i < 10; i++) {
        await memory.store(
          { data: `Memory ${i}` },
          ['test'],
          0.1 + (i * 0.1)  // Varying importance
        );
      }

      await memory.prune();

      // Check that low importance memories were pruned
      const remaining = await prisma.memory.findMany({
        where: {
          importance: {
            lt: 0.3
          }
        }
      });

      expect(remaining.length).toBe(0);
    });
  });

  describe('Ring Management', () => {
    it('should retrieve memories from specific rings', async () => {
      // Store memories in different rings
      await memory.store(
        { data: 'Core memory' },
        ['test'],
        0.9  // Core ring
      );

      await memory.store(
        { data: 'Middle ring memory' },
        ['test'],
        0.5  // Middle ring
      );

      await memory.store(
        { data: 'Outer ring memory' },
        ['test'],
        0.1  // Outer ring
      );

      const coreMemories = await memory.getRing(0);
      expect(coreMemories.length).toBe(1);
      expect(coreMemories[0].content.data).toBe('Core memory');

      const middleMemories = await memory.getRing(2);
      expect(middleMemories.length).toBe(1);
      expect(middleMemories[0].content.data).toBe('Middle ring memory');

      const outerMemories = await memory.getRing(4);
      expect(outerMemories.length).toBe(1);
      expect(outerMemories[0].content.data).toBe('Outer ring memory');
    });
  });
});
