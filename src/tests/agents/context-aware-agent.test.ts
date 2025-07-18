import { ContextAwareAgent } from '../../lib/agents/context-aware-agent';
import { TreeRingMemory } from '../../../lib/memory/tree-ring-memory';

// Mock TreeRingMemory
jest.mock('../../../lib/memory/tree-ring-memory');

describe('ContextAwareAgent', () => {
  let agent: ContextAwareAgent;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create agent instance
    agent = new ContextAwareAgent({
      name: 'test-agent',
      type: 'context-test',
      capabilities: ['test'],
      configuration: {}
    });
  });

  describe('Context Detection', () => {
    it('should detect user role context', async () => {
      const message = {
        type: 'test',
        context: {
          metadata: {
            userRole: 'artist'
          }
        }
      };

      await agent.handleMessage(message);
      const info = await agent.getContextInfo();
      
      expect(info.active).toContain('role:artist');
    });

    it('should detect time-based context', async () => {
      const message = { type: 'test' };
      
      // Mock current time to 9am
      jest.spyOn(global.Date.prototype, 'getHours').mockReturnValue(9);
      
      await agent.handleMessage(message);
      const info = await agent.getContextInfo();
      
      expect(info.active).toContain('time:morning');
    });

    it('should detect priority context', async () => {
      const message = {
        type: 'urgent_request',
        content: {}
      };

      await agent.handleMessage(message);
      const info = await agent.getContextInfo();
      
      expect(info.active).toContain('priority:high');
    });
  });

  describe('Pattern Learning', () => {
    it('should store and score context patterns', async () => {
      // Mock successful pattern
      const pattern = {
        trigger: 'test_trigger',
        context: 'role:artist',
        confidence: 0.9,
        action: 'test',
        outcome: 'success',
        timestamp: new Date()
      };

      // Mock TreeRingMemory search to return our pattern
      (TreeRingMemory as jest.Mock).mockImplementation(() => ({
        search: jest.fn().mockResolvedValue([{ content: pattern }]),
        save: jest.fn()
      }));

      await agent.initialize();
      const info = await agent.getContextInfo();
      
      const score = info.scores.get('test_trigger');
      expect(score).toBeDefined();
      expect(score.score).toBeGreaterThan(0.5);
    });
  });

  describe('Task Adaptation', () => {
    it('should adapt task priority based on context', async () => {
      const task = {
        id: 'test',
        type: 'test_task',
        priority: 5,
        input: {},
        context: {
          metadata: {
            userRole: 'artist'
          }
        }
      };

      // Set high priority context
      await agent.handleMessage({
        type: 'urgent_request',
        content: {}
      });

      // Process task
      const result = await agent.processTask(task);
      
      expect(result.priority).toBeGreaterThan(task.priority);
    });

    it('should apply learned patterns to tasks', async () => {
      // Mock a successful pattern
      const pattern = {
        trigger: 'test_task',
        context: 'role:artist',
        confidence: 0.9,
        action: 'test',
        outcome: 'success',
        timestamp: new Date()
      };

      // Mock TreeRingMemory to return our pattern
      (TreeRingMemory as jest.Mock).mockImplementation(() => ({
        search: jest.fn().mockResolvedValue([{ content: pattern }]),
        save: jest.fn()
      }));

      await agent.initialize();

      const task = {
        id: 'test',
        type: 'test_task',
        priority: 5,
        input: {},
        context: {
          metadata: {
            userRole: 'artist'
          }
        }
      };

      const result = await agent.processTask(task);
      
      expect(result.input).toHaveProperty('learnedPattern');
    });
  });
});
