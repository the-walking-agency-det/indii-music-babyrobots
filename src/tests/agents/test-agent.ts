import { BaseAgent, AgentConfig, AgentTask, AgentContext } from '../../lib/agents/base-agent';
import { MockMemoryManager } from '../mocks/mock-memory-manager';

export class TestAgent extends BaseAgent {
  constructor(config: AgentConfig) {
super(config, new MockMemoryManager(config.name));
  }

  // Implementation of abstract method
  protected async processTask(task: AgentTask): Promise<any> {
    // Simple task processing logic for testing
    return {
      processed: true,
      taskType: task.type,
      result: `Processed ${task.type} task`
    };
  }

  // Expose protected methods for testing
  public async testLearnFromExperience(): Promise<void> {
    return this.learnFromExperience();
  }

  public testApplyPatternToConfig(patterns: any[]): Record<string, any> {
    return this.applyPatternToConfig(patterns);
  }

  async sendMessage(toAgent: string, type: string, content: any, context: AgentContext): Promise<void> {
    const memoryContent = {
      type,
      content: JSON.stringify(content),
      to: toAgent,
      timestamp: context.timestamp
    };

    await this.memory.store(memoryContent, ['message', type], 0.5);
  }

  async handleTask(task: any): Promise<void> {
    const memoryContent = {
      type: 'task',
      taskId: task.id,
      taskType: task.type,
      content: JSON.stringify(task.input),
      timestamp: task.context.timestamp
    };

    await this.memory.store(memoryContent, ['task', task.type], task.priority / 10);
    await this.processTask(task);
  }

  async searchMemories(query: string): Promise<any[]> {
    return this.memory.searchMemories(query, 10);
  }

  async getRecentMemories(tags: string[]): Promise<any[]> {
    return this.memory.getRecentMemories(tags);
  }
}
