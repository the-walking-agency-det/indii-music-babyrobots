import { describe, it, beforeEach, expect, vi } from 'vitest';
import { TestAgent } from '../agents/test-agent';
import { AgentContext } from '../../lib/agents/base-agent';

describe('Agent Memory System Tests', () => {
  let agent: TestAgent;
  let context: AgentContext;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new TestAgent({
      name: 'test-agent',
      type: 'test',
      capabilities: ['memory-test'],
      configuration: {}
    });

    context = {
      timestamp: new Date(),
      metadata: {}
    };
  });

  describe('Basic Memory Operations', () => {
    it('should store and retrieve messages', async () => {
      const message = {
        type: 'test',
        content: 'Hello, world!',
        to: 'other-agent'
      };

      await agent.sendMessage('other-agent', 'test', message, context);
      
      const memories = await agent.searchMemories('Hello, world');
      expect(memories.length).toBeGreaterThan(0);
      expect(memories[0].content).toContain('Hello, world');
    });

    it('should store and retrieve tasks', async () => {
      const task = {
        id: '123',
        type: 'test-task',
        priority: 5,
        input: { data: 'test' },
        context
      };

      await agent.handleTask(task);
      
      const memories = await agent.searchMemories('test-task');
      expect(memories.length).toBeGreaterThan(0);
      expect(memories[0].metadata.type).toBe('task');
    });
  });

  describe('Learning Capabilities', () => {
    it('should learn from experiences', async () => {
      // Store some test experiences
      await agent.memory.store(
        { type: 'success', action: 'process', details: 'Fast processing' },
        ['experience', 'success'],
        0.8
      );

      await agent.memory.store(
        { type: 'error', action: 'process', details: 'Timeout error' },
        ['experience', 'error'],
        0.6
      );

      // Trigger learning
      await agent.testLearnFromExperience();

      // Check for learned patterns
      const patterns = await agent.searchMemories('learned_pattern');
      expect(patterns.length).toBeGreaterThan(0);
    });

    it('should apply learned patterns to configuration', async () => {
      const testPatterns = [
        {
          type: 'performance_improvement',
          parameter: 'processingTimeout',
          optimizedValue: 5000
        },
        {
          type: 'error_prevention',
          condition: 'maxRetries',
          threshold: 3
        }
      ];

      const updates = agent.testApplyPatternToConfig(testPatterns);
      expect(updates.processingTimeout).toBe(5000);
      expect(updates['validation.maxRetries']).toBe(3);
    });
  });

  describe('Memory Search and Retrieval', () => {
    it('should perform semantic search', async () => {
      // Store various types of content
      await agent.memory.store(
        { content: 'The quick brown fox jumps over the lazy dog' },
        ['test', 'sentence', 'animal'],
        0.5
      );

      await agent.memory.store(
        { content: 'A fox quickly jumped over a dog' },
        ['test', 'similar', 'animal'],
        0.5
      );

      await agent.memory.store(
        { content: 'The weather is nice today' },
        ['test', 'unrelated'],
        0.5
      );

      // Search for semantically similar content
      const results = await agent.searchMemories('fox jumping dog');
      expect(results.length).toBeGreaterThan(0);
      // Both memories should be found due to semantic similarity
      expect(results.length).toBe(2);
    });

    it('should retrieve recent memories by tags', async () => {
      await agent.memory.store(
        { content: 'Recent memory 1' },
        ['test', 'recent'],
        0.5
      );

      await agent.memory.store(
        { content: 'Recent memory 2' },
        ['test', 'recent'],
        0.5
      );

      const recentMemories = await agent.getRecentMemories(['test', 'recent']);
      expect(recentMemories.length).toBe(2);
    });
  });

  describe('Memory Integration Tests', () => {
    it('should maintain context across interactions', async () => {
      // Simulate a sequence of related interactions
      await agent.sendMessage('other-agent', 'start', { phase: 1 }, context);
      
      const task = {
        id: '124',
        type: 'continuation',
        priority: 5,
        input: { phase: 2 },
        context
      };
      
      await agent.handleTask(task);
      
      await agent.sendMessage('other-agent', 'complete', { phase: 3 }, context);

      // Search for the entire sequence
      const sequence = await agent.searchMemories('phase');
      expect(sequence.length).toBe(3);
      expect(sequence.map(m => m.content)).toContain(JSON.stringify({ phase: 1 }));
      expect(sequence.map(m => m.content)).toContain(JSON.stringify({ phase: 2 }));
      expect(sequence.map(m => m.content)).toContain(JSON.stringify({ phase: 3 }));
    });

    it('should learn from repeated patterns', async () => {
      // Simulate repeated successful and failed interactions
      for (let i = 0; i < 5; i++) {
        await agent.memory.store(
          { 
            type: 'process',
            success: true,
            duration: 100 + i * 10,
            resource: 'API'
          },
          ['process', 'success'],
          0.7
        );
      }

      for (let i = 0; i < 3; i++) {
        await agent.memory.store(
          {
            type: 'process',
            success: false,
            error: 'timeout',
            duration: 500 + i * 100,
            resource: 'API'
          },
          ['process', 'error'],
          0.8
        );
      }

      // Trigger learning
      await agent.testLearnFromExperience();

      // Check for learned patterns about API processing
      const patterns = await agent.searchMemories('process API');
      expect(patterns.length).toBeGreaterThan(0);
      
      // The learned patterns should indicate something about timeouts
      const timeoutPatterns = patterns.filter(p => 
        p.content.includes('timeout') || 
        p.content.includes('duration')
      );
      expect(timeoutPatterns.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty or invalid searches gracefully', async () => {
      const emptyResults = await agent.searchMemories('');
      expect(Array.isArray(emptyResults)).toBe(true);

      const invalidResults = await agent.searchMemories('   ');
      expect(Array.isArray(invalidResults)).toBe(true);
    });

    it('should handle concurrent memory operations', async () => {
      // Create multiple concurrent operations
      const operations = [];
      for (let i = 0; i < 10; i++) {
        operations.push(
          agent.memory.store(
            { content: `Concurrent test ${i}` },
            ['test', 'concurrent'],
            0.5
          )
        );
      }

      // All operations should complete without errors
      await expect(Promise.all(operations)).resolves.toBeDefined();

      // Verify all memories were stored
      const results = await agent.searchMemories('Concurrent test');
      expect(results.length).toBe(10);
    });
  });
});
