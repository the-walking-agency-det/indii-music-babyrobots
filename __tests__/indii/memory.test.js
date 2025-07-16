import { getMemoryManager } from '../../src/lib/memory';
import { RushMemory } from '../../src/lib/memory/rush-memory';
import { CrashMemory } from '../../src/lib/memory/crash-memory';
import { IndiiAgent } from '../../lib/agents/indii-agent';
import { mockArtistData, mockAnalytics, mockConversation } from '../__fixtures__/mockData';

describe('indii Memory System Tests', () => {
  let memory;
  let agent;
  let testSessionId;
  let testArtistId;

  beforeAll(async () => {
    memory = getMemoryManager({
      rushTtl: 1000, // 1 second for testing
      maxRushSize: 100,
      enableVectorSearch: true
    });

    agent = new IndiiAgent();
    testSessionId = 'test_session_123';
    testArtistId = 'test_artist_456';
  });

  beforeEach(async () => {
    await memory.cleanup();
  });

  describe('Rush Memory (Short-term)', () => {
    test('basic read/write operations', async () => {
      const testData = { msg: 'test message', timestamp: Date.now() };
      
      await memory.updateContext(
        testSessionId,
        'indii',
        'conversation',
        testData,
        { persistent: false }
      );

      const retrieved = await memory.getContext(
        testSessionId,
        'indii',
        'conversation'
      );

      expect(retrieved).toEqual(testData);
    });

    test('TTL expiration', async () => {
      const testData = { msg: 'expiring message', timestamp: Date.now() };
      
      await memory.updateContext(
        testSessionId,
        'indii',
        'temp_data',
        testData,
        { persistent: false }
      );

      // Wait for TTL
      await new Promise(resolve => setTimeout(resolve, 1100));

      const retrieved = await memory.getContext(
        testSessionId,
        'indii',
        'temp_data'
      );

      expect(retrieved).toBeNull();
    });

    test('LRU eviction', async () => {
      // Fill memory to max
      for (let i = 0; i < 101; i++) {
        await memory.updateContext(
          `session_${i}`,
          'indii',
          'test_data',
          { value: i },
          { persistent: false }
        );
      }

      // First entry should be evicted
      const firstEntry = await memory.getContext(
        'session_0',
        'indii',
        'test_data'
      );

      expect(firstEntry).toBeNull();
    });

    test('context isolation', async () => {
      const session1Data = { msg: 'session 1 data' };
      const session2Data = { msg: 'session 2 data' };

      await memory.updateContext(
        'session_1',
        'indii',
        'test_scope',
        session1Data,
        { persistent: false }
      );

      await memory.updateContext(
        'session_2',
        'indii',
        'test_scope',
        session2Data,
        { persistent: false }
      );

      const retrieved1 = await memory.getContext(
        'session_1',
        'indii',
        'test_scope'
      );
      const retrieved2 = await memory.getContext(
        'session_2',
        'indii',
        'test_scope'
      );

      expect(retrieved1).toEqual(session1Data);
      expect(retrieved2).toEqual(session2Data);
    });
  });

  describe('Crash Memory (Long-term)', () => {
    test('data persistence', async () => {
      const testData = { 
        msg: 'persistent message',
        timestamp: Date.now()
      };

      await memory.updateContext(
        testSessionId,
        'indii',
        'persistent_data',
        testData,
        { persistent: true }
      );

      // Simulate system restart by creating new memory manager
      const newMemory = getMemoryManager();
      
      const retrieved = await newMemory.getContext(
        testSessionId,
        'indii',
        'persistent_data'
      );

      expect(retrieved).toEqual(testData);
    });

    test('artist profile persistence', async () => {
      await memory.updateContext(
        testSessionId,
        'indii',
        'artist_profile',
        mockArtistData,
        { persistent: true }
      );

      const retrieved = await memory.getContext(
        testSessionId,
        'indii',
        'artist_profile'
      );

      expect(retrieved).toEqual(mockArtistData);
    });

    test('conversation history persistence', async () => {
      await memory.updateContext(
        testSessionId,
        'indii',
        'conversation_history',
        mockConversation,
        { persistent: true }
      );

      const retrieved = await memory.getContext(
        testSessionId,
        'indii',
        'conversation_history'
      );

      expect(retrieved).toEqual(mockConversation);
    });
  });

  describe('Memory Search', () => {
    beforeEach(async () => {
      // Seed test data
      await memory.updateContext(
        testSessionId,
        'indii',
        'conversation',
        mockConversation,
        { persistent: true }
      );

      await memory.updateContext(
        testSessionId,
        'indii',
        'artist_data',
        mockArtistData,
        { persistent: true }
      );

      await memory.updateContext(
        testSessionId,
        'indii',
        'analytics',
        mockAnalytics,
        { persistent: true }
      );
    });

    test('basic search functionality', async () => {
      const results = await memory.searchContext(
        'release strategy',
        testSessionId,
        'indii',
        'conversation'
      );

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].content).toContain('release strategy');
    });

    test('multi-scope search', async () => {
      const results = await memory.searchContext(
        'streaming',
        testSessionId,
        'indii',
        '*'
      );

      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.scope === 'analytics')).toBeTruthy();
      expect(results.some(r => r.scope === 'artist_data')).toBeTruthy();
    });

    test('relevance scoring', async () => {
      const results = await memory.searchContext(
        'marketing campaign',
        testSessionId,
        'indii',
        '*'
      );

      expect(results).toBeSorted((a, b) => b.score - a.score);
    });
  });

  describe('Performance', () => {
    test('memory usage stays within limits', async () => {
      const initialStats = await memory.getStats();
      
      // Add significant test data
      for (let i = 0; i < 1000; i++) {
        await memory.updateContext(
          `session_${i}`,
          'indii',
          'test_data',
          { value: `test_${i}` },
          { persistent: false }
        );
      }

      const finalStats = await memory.getStats();
      
      expect(finalStats.rush.estimated_size_bytes).toBeLessThan(
        initialStats.rush.max_size_bytes
      );
    });

    test('search performance under load', async () => {
      // Seed test data
      for (let i = 0; i < 100; i++) {
        await memory.updateContext(
          testSessionId,
          'indii',
          `test_scope_${i}`,
          { content: `test content ${i}` },
          { persistent: true }
        );
      }

      const startTime = Date.now();
      const results = await memory.searchContext(
        'test content',
        testSessionId,
        'indii',
        '*'
      );
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(200); // Max 200ms
      expect(results.length).toBeGreaterThan(50);
    });
  });
});
