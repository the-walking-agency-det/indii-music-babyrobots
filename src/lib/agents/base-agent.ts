import { PrismaClient } from '@prisma/client';
import { TreeRingsMemory } from '../memory/tree-rings';
import { EventEmitter } from 'events';

export interface AgentConfig {
  name: string;
  type: string;
  capabilities: string[];
  configuration: Record<string, any>;
}

export interface AgentContext {
  userId?: string;
  sessionId?: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: string;
  content: any;
  context: AgentContext;
  timestamp: Date;
}

export interface AgentTask {
  id: string;
  type: string;
  priority: number;
  input: any;
  context: AgentContext;
}

export abstract class BaseAgent extends EventEmitter {
  protected name: string;
  protected type: string;
  protected capabilities: string[];
  protected config: Record<string, any>;
  protected memory: TreeRingsMemory;
  protected prisma: PrismaClient;
  protected active: boolean = false;

  constructor(config: AgentConfig) {
    super();
    this.name = config.name;
    this.type = config.type;
    this.capabilities = config.capabilities;
    this.config = config.configuration;
    this.memory = new TreeRingsMemory();
    this.prisma = new PrismaClient();
  }

  /**
   * Initialize the agent
   */
  async initialize(): Promise<void> {
    // Register agent in database
    await this.prisma.agent.upsert({
      where: { name: this.name },
      update: {
        type: this.type,
        capabilities: this.capabilities,
        configuration: this.config,
        lastActive: new Date()
      },
      create: {
        name: this.name,
        type: this.type,
        capabilities: this.capabilities,
        configuration: this.config
      }
    });

    this.active = true;
    this.emit('initialized');
  }

  /**
   * Handle incoming messages from other agents
   */
  async handleMessage(message: AgentMessage): Promise<void> {
    // Store message in memory
    await this.memory.store(
      message,
      ['message', message.type, `from:${message.from}`],
      0.5
    );

    // Emit message event
    this.emit('message', message);

    // Process message based on type
    switch (message.type) {
      case 'task':
        await this.handleTask(message.content);
        break;
      case 'query':
        await this.handleQuery(message.content);
        break;
      case 'update':
        await this.handleUpdate(message.content);
        break;
      default:
        await this.handleCustomMessage(message);
    }
  }

  /**
   * Send a message to another agent
   */
  async sendMessage(to: string, type: string, content: any, context: AgentContext): Promise<void> {
    const message: AgentMessage = {
      id: crypto.randomUUID(),
      from: this.name,
      to,
      type,
      content,
      context,
      timestamp: new Date()
    };

    // Store outgoing message in memory
    await this.memory.store(
      message,
      ['message', type, `to:${to}`],
      0.5
    );

    // Emit message event
    this.emit('messageSent', message);

    // Send message through message bus or direct call
    // Implementation depends on system architecture
  }

  /**
   * Handle incoming tasks
   */
  protected async handleTask(task: AgentTask): Promise<void> {
    // Store task in database
    await this.prisma.task.create({
      data: {
        id: task.id,
        agentId: this.name,
        type: task.type,
        priority: task.priority,
        input: task.input,
        status: 'pending'
      }
    });

    // Store in memory
    await this.memory.store(
      task,
      ['task', task.type],
      task.priority / 10
    );

    // Process task
    try {
      const result = await this.processTask(task);
      
      // Update task status
      await this.prisma.task.update({
        where: { id: task.id },
        data: {
          status: 'completed',
          output: result,
          completed: new Date()
        }
      });

      this.emit('taskCompleted', { task, result });
    } catch (error) {
      await this.prisma.task.update({
        where: { id: task.id },
        data: {
          status: 'failed',
          error: error.message
        }
      });

      this.emit('taskFailed', { task, error });
    }
  }

  /**
   * Process a task - to be implemented by specific agents
   */
  protected abstract processTask(task: AgentTask): Promise<any>;

  /**
   * Handle queries
   */
  protected async handleQuery(query: any): Promise<void> {
    // Implementation depends on agent type
  }

  /**
   * Handle update messages
   */
  protected async handleUpdate(update: any): Promise<void> {
    // Implementation depends on agent type
  }

  /**
   * Handle custom message types
   */
  protected async handleCustomMessage(message: AgentMessage): Promise<void> {
    // Implementation depends on agent type
  }

  /**
   * Check if agent has a specific capability
   */
  hasCapability(capability: string): boolean {
    return this.capabilities.includes(capability);
  }

  /**
   * Update agent configuration
   */
  async updateConfig(updates: Record<string, any>): Promise<void> {
    this.config = { ...this.config, ...updates };
    
    await this.prisma.agent.update({
      where: { name: this.name },
      data: {
        configuration: this.config,
        lastActive: new Date()
      }
    });
  }

  /**
   * Deactivate the agent
   */
  async deactivate(): Promise<void> {
    this.active = false;
    
    await this.prisma.agent.update({
      where: { name: this.name },
      data: { active: false }
    });

    this.emit('deactivated');
  }

  /**
   * Check if agent is active
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Get agent status
   */
  async getStatus(): Promise<Record<string, any>> {
    const tasks = await this.prisma.task.findMany({
      where: {
        agentId: this.name,
        status: 'in_progress'
      }
    });

    return {
      name: this.name,
      type: this.type,
      active: this.active,
      capabilities: this.capabilities,
      activeTasks: tasks.length,
      lastActive: new Date()
    };
  }
}
