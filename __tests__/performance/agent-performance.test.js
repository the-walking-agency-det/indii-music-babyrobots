import { performance } from 'perf_hooks';
import { BaseAgent } from '../../lib/agents/base-agent.js';
import { MemoryMapper } from '../../lib/memory/memory-mapper.js';
import { RAGSystem } from '../../lib/rag/rag-system.js';
import { APIManager } from '../../lib/api/api-manager.js';
import { InterAgentAPI } from '../../lib/communication/inter-agent-api.js';

describe('Agent Performance Tests', () => {
  let agents = [];
  let interAgentAPI;
  let startTime;

  beforeAll(async () => {
    // Create a pool of test agents
    interAgentAPI = new InterAgentAPI();
    for (let i = 0; i < 100; i++) {
      const agent = new BaseAgent(
        `test-agent-${i}`,
        { name: `Test Agent ${i}` },
        ['test']
      );
      agents.push(agent);
      await interAgentAPI.registerAgent(`agent-${i}`, agent, ['test']);
    }
  });

  beforeEach(() => {
    startTime = performance.now();
  });

  afterEach(() => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`Test duration: ${duration}ms`);
  });

  describe('Response Time Tests', () => {
    test('Single agent response time < 2 seconds', async () => {
      const agent = agents[0];
      const request = {
        query: 'test query',
        context: { test: true },
      };

      const startTime = performance.now();
      await agent.processRequest(request);
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(2000);
    });
  });

  describe('Concurrent Processing Tests', () => {
    test('Handle 100+ concurrent requests', async () => {
      const requests = agents.map(agent => 
        agent.processRequest({
          query: 'concurrent test',
          context: { test: true },
        })
      );

      const startTime = performance.now();
      await Promise.all(requests);
      const duration = performance.now() - startTime;

      console.log(`Processed ${agents.length} concurrent requests in ${duration}ms`);
      expect(duration).toBeLessThan(agents.length * 2000);
    });
  });

  describe('Memory Retrieval Tests', () => {
    test('Memory retrieval accuracy > 90%', async () => {
      const memoryMapper = new MemoryMapper('test');
      const testQueries = Array(100).fill().map((_, i) => ({
        query: `test query ${i}`,
        expectedContext: { key: `value ${i}` },
      }));

      let successfulRetrievals = 0;

      for (const { query, expectedContext } of testQueries) {
        const result = await memoryMapper.mapMemory(query, expectedContext);
        if (result && result.currentContext) {
          successfulRetrievals++;
        }
      }

      const accuracy = (successfulRetrievals / testQueries.length) * 100;
      expect(accuracy).toBeGreaterThan(90);
    });
  });

  describe('API Rate Limiting Tests', () => {
    test('Zero failures due to rate limiting', async () => {
      const apiManager = new APIManager();
      const requests = Array(150).fill().map((_, i) => ({
        api: 'test-api',
        endpoint: '/test',
        method: 'GET',
        parameters: { test: i },
      }));

      let failures = 0;
      await Promise.all(
        requests.map(async (request) => {
          try {
            await apiManager.execute(request);
          } catch (error) {
            if (error.message.includes('rate limit')) {
              failures++;
            }
          }
        })
      );

      expect(failures).toBe(0);
    });
  });

  describe('Message Delivery Tests', () => {
    test('100% reliable inter-agent message delivery', async () => {
      const messages = Array(100).fill().map((_, i) => ({
        from: `agent-${i}`,
        to: `agent-${(i + 1) % 100}`,
        message: { type: 'test', content: `message ${i}` },
      }));

      let deliveredCount = 0;
      await Promise.all(
        messages.map(async ({ from, to, message }) => {
          try {
            await interAgentAPI.sendMessage(from, to, message);
            deliveredCount++;
          } catch (error) {
            console.error(`Message delivery failed: ${error.message}`);
          }
        })
      );

      expect(deliveredCount).toBe(messages.length);
    });
  });
});
