import { EventEmitter } from 'events';
import { AgentMessage, AgentTask } from './base-agent';
import { TreeRingsMemory } from '../memory/tree-rings';

export class AgentEventSystem extends EventEmitter {
  private static instance: AgentEventSystem;
  private memory: TreeRingsMemory;
  private activeChannels: Set<string> = new Set();
  private subscribers: Map<string, Set<string>> = new Map();

  private constructor() {
    super();
    this.memory = new TreeRingsMemory();
    this.setupEventHandlers();
  }

  public static getInstance(): AgentEventSystem {
    if (!AgentEventSystem.instance) {
      AgentEventSystem.instance = new AgentEventSystem();
    }
    return AgentEventSystem.instance;
  }

  /**
   * Set up core event handlers
   */
  private setupEventHandlers(): void {
    // Handle agent registration
    this.on('agentRegistered', (agentId: string) => {
      this.activeChannels.add(agentId);
      this.storeEvent('agentRegistered', { agentId });
    });

    // Handle agent deregistration
    this.on('agentDeregistered', (agentId: string) => {
      this.activeChannels.delete(agentId);
      this.subscribers.delete(agentId);
      this.storeEvent('agentDeregistered', { agentId });
    });

    // Handle subscription changes
    this.on('subscriptionChanged', ({ subscriber, publisher, action }) => {
      this.updateSubscription(subscriber, publisher, action === 'subscribe');
      this.storeEvent('subscriptionChanged', { subscriber, publisher, action });
    });
  }

  /**
   * Store event in memory system
   */
  private async storeEvent(type: string, data: any): Promise<void> {
    await this.memory.store(
      {
        type,
        data,
        timestamp: new Date()
      },
      ['event', type],
      0.4
    );
  }

  /**
   * Register an agent with the event system
   */
  async registerAgent(agentId: string): Promise<void> {
    this.emit('agentRegistered', agentId);
  }

  /**
   * Deregister an agent from the event system
   */
  async deregisterAgent(agentId: string): Promise<void> {
    this.emit('agentDeregistered', agentId);
  }

  /**
   * Subscribe an agent to another agent's events
   */
  async subscribe(subscriber: string, publisher: string): Promise<void> {
    this.emit('subscriptionChanged', {
      subscriber,
      publisher,
      action: 'subscribe'
    });
  }

  /**
   * Unsubscribe an agent from another agent's events
   */
  async unsubscribe(subscriber: string, publisher: string): Promise<void> {
    this.emit('subscriptionChanged', {
      subscriber,
      publisher,
      action: 'unsubscribe'
    });
  }

  /**
   * Update subscription mappings
   */
  private updateSubscription(subscriber: string, publisher: string, subscribe: boolean): void {
    if (!this.subscribers.has(publisher)) {
      this.subscribers.set(publisher, new Set());
    }

    const subs = this.subscribers.get(publisher)!;
    if (subscribe) {
      subs.add(subscriber);
    } else {
      subs.delete(subscriber);
    }
  }

  /**
   * Publish a message to subscribed agents
   */
  async publishMessage(message: AgentMessage): Promise<void> {
    const subscribers = this.subscribers.get(message.from) || new Set();
    
    // Store message in memory
    await this.memory.store(
      message,
      ['message', message.type],
      0.5
    );

    // Emit to all subscribers
    subscribers.forEach(subscriber => {
      if (this.activeChannels.has(subscriber)) {
        this.emit(`message:${subscriber}`, message);
      }
    });
  }

  /**
   * Broadcast a message to all active agents
   */
  async broadcast(message: AgentMessage): Promise<void> {
    await this.memory.store(
      message,
      ['broadcast', message.type],
      0.6
    );

    this.activeChannels.forEach(channel => {
      this.emit(`message:${channel}`, message);
    });
  }

  /**
   * Send a direct message to a specific agent
   */
  async sendDirect(message: AgentMessage): Promise<void> {
    if (this.activeChannels.has(message.to)) {
      await this.memory.store(
        message,
        ['direct', message.type],
        0.5
      );
      this.emit(`message:${message.to}`, message);
    }
  }

  /**
   * Delegate a task to an agent
   */
  async delegateTask(task: AgentTask, targetAgent: string): Promise<void> {
    if (this.activeChannels.has(targetAgent)) {
      await this.memory.store(
        task,
        ['task', task.type],
        task.priority / 10
      );
      this.emit(`task:${targetAgent}`, task);
    }
  }

  /**
   * Get all active channels
   */
  getActiveChannels(): string[] {
    return Array.from(this.activeChannels);
  }

  /**
   * Get subscribers for a specific agent
   */
  getSubscribers(agentId: string): string[] {
    return Array.from(this.subscribers.get(agentId) || []);
  }

  /**
   * Check if an agent is active
   */
  isAgentActive(agentId: string): boolean {
    return this.activeChannels.has(agentId);
  }

  /**
   * Get event history from memory
   */
  async getEventHistory(filter?: {
    type?: string;
    timeRange?: { start: Date; end: Date };
  }): Promise<any[]> {
    const query = {
      context: filter?.type ? ['event', filter.type] : ['event'],
      timeRange: filter?.timeRange
    };

    const events = await this.memory.query(query);
    return events.map(e => e.content);
  }
}
