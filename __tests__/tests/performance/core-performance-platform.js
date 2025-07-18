import { performance } from 'perf_hooks';
import { BaseAgent } from '../../lib/agents/base-agent.js';
import { MemoryMapper } from '../../lib/memory/memory-mapper.js';
import { RAGSystem } from '../../lib/rag/rag-system.js';

// Core Performance Measurement System
class PerformanceMetrics {
  constructor() {
    this.measurements = new Map();
    this.thresholds = {
      responseTime: 2000,    // 2 seconds
      memoryAccuracy: 0.9,   // 90%
      messageDelivery: 1.0   // 100%
    };
  }

  startMeasurement(label) {
    this.measurements.set(label, {
      start: performance.now(),
      measurements: []
    });
  }

  endMeasurement(label) {
    const measurement = this.measurements.get(label);
    if (measurement) {
      const duration = performance.now() - measurement.start;
      measurement.measurements.push(duration);
      return duration;
    }
    return null;
  }

  getAverageTime(label) {
    const measurement = this.measurements.get(label);
    if (measurement && measurement.measurements.length > 0) {
      const sum = measurement.measurements.reduce((a, b) => a + b, 0);
      return sum / measurement.measurements.length;
    }
    return null;
  }

  reset() {
    this.measurements.clear();
  }
}

// Core Test Agent for Performance Testing
class TestAgent extends BaseAgent {
  constructor(id) {
    super(
      `test-agent-${id}`,
      { name: `Test Agent ${id}`, type: 'performance-test' },
      ['test', 'measure', 'benchmark']
    );
    this.metrics = new PerformanceMetrics();
  }

  async runPerformanceTest() {
    this.metrics.startMeasurement('total');
    
    // Test 1: Response Time
    this.metrics.startMeasurement('response');
    await this.processRequest({
      query: 'performance test query',
      context: { test: true }
    });
    const responseTime = this.metrics.endMeasurement('response');

    // Test 2: Memory Accuracy
    this.metrics.startMeasurement('memory');
    const memoryResult = await this.memory.mapMemory(
      'test memory query',
      { expectedContext: true }
    );
    const memoryTime = this.metrics.endMeasurement('memory');

    // Test 3: RAG Performance
    this.metrics.startMeasurement('rag');
    const ragResult = await this.rag.query(
      'test rag query',
      { agentContext: this.agentType }
    );
    const ragTime = this.metrics.endMeasurement('rag');

    const totalTime = this.metrics.endMeasurement('total');

    return {
      responseTime,
      memoryTime,
      ragTime,
      totalTime,
      memoryAccuracy: memoryResult ? 1 : 0,
      ragSuccess: ragResult ? true : false
    };
  }
}

// Test Runner
class PerformanceTestRunner {
  constructor(agentCount = 1) {
    this.agents = Array(agentCount).fill(null).map((_, i) => new TestAgent(i));
    this.metrics = new PerformanceMetrics();
  }

  async runSingleAgentTest() {
    console.log('Running single agent performance test...');
    const results = await this.agents[0].runPerformanceTest();
    this.logResults('Single Agent Test', results);
    return results;
  }

  async runConcurrentTest() {
    console.log(`Running concurrent test with ${this.agents.length} agents...`);
    this.metrics.startMeasurement('concurrent');
    
    const results = await Promise.all(
      this.agents.map(agent => agent.runPerformanceTest())
    );
    
    const concurrentTime = this.metrics.endMeasurement('concurrent');
    
    const averages = {
      responseTime: results.reduce((sum, r) => sum + r.responseTime, 0) / results.length,
      memoryTime: results.reduce((sum, r) => sum + r.memoryTime, 0) / results.length,
      ragTime: results.reduce((sum, r) => sum + r.ragTime, 0) / results.length,
      totalTime: results.reduce((sum, r) => sum + r.totalTime, 0) / results.length,
      concurrentTime
    };

    this.logResults('Concurrent Test Averages', averages);
    return averages;
  }

  logResults(label, results) {
    console.log('\n' + '='.repeat(50));
    console.log(label);
    console.log('='.repeat(50));
    Object.entries(results).forEach(([key, value]) => {
      console.log(`${key}: ${value.toFixed(2)}ms`);
    });
    console.log('='.repeat(50) + '\n');
  }

  validateResults(results) {
    const validations = {
      responseTime: results.responseTime < this.metrics.thresholds.responseTime,
      memoryAccuracy: results.memoryAccuracy >= this.metrics.thresholds.memoryAccuracy,
      performance: results.totalTime < (this.metrics.thresholds.responseTime * 2)
    };

    console.log('\nValidation Results:');
    Object.entries(validations).forEach(([test, passed]) => {
      console.log(`${test}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    });

    return Object.values(validations).every(v => v);
  }
}

// Export for use in other tests
export {
  PerformanceMetrics,
  TestAgent,
  PerformanceTestRunner
};
