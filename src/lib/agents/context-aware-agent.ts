import { BaseAgent, AgentConfig, AgentContext, AgentTask } from './base-agent';
import { TreeRingMemory } from '../../../lib/memory/tree-ring-memory';

interface ContextPattern {
  trigger: string;
  context: string;
  confidence: number;
  action: string;
  outcome: string;
  timestamp: Date;
}

interface ContextScore {
  pattern: string;
  score: number;
  confidence: number;
}

export class ContextAwareAgent extends BaseAgent {
  protected contextMemory: TreeRingMemory;
  protected activeContexts: Set<string> = new Set();
  protected contextScores: Map<string, ContextScore> = new Map();
  
  constructor(config: AgentConfig) {
    super(config);
    this.contextMemory = new TreeRingMemory({
      agentType: 'context',
      rushMemoryOptions: { ttl: 30 * 60 * 1000 } // 30 min TTL for context
    });
  }

  /**
   * Enhanced initialization with context learning
   */
  async initialize(): Promise<void> {
    await super.initialize();
    await this.loadContextPatterns();
  }

  /**
   * Load and analyze context patterns from memory
   */
  private async loadContextPatterns(): Promise<void> {
    try {
      const patterns = await this.contextMemory.search('context_pattern', '', '', 100);
      
      for (const pattern of patterns) {
        const contextPattern = pattern.content as ContextPattern;
        await this.evaluateContextPattern(contextPattern);
      }
    } catch (error) {
      console.error('Error loading context patterns:', error);
    }
  }

  /**
   * Evaluate and score a context pattern
   */
  private async evaluateContextPattern(pattern: ContextPattern): Promise<void> {
    const score: ContextScore = {
      pattern: pattern.trigger,
      score: 0,
      confidence: pattern.confidence
    };

    // Score based on recency
    const ageInHours = (new Date().getTime() - pattern.timestamp.getTime()) / (1000 * 60 * 60);
    score.score += Math.max(0, 1 - (ageInHours / 24)); // Decay over 24 hours

    // Score based on outcome success
    if (pattern.outcome === 'success') {
      score.score += 0.5;
    }

    this.contextScores.set(pattern.trigger, score);
  }

  /**
   * Enhanced message handling with context awareness
   */
  async handleMessage(message: AgentMessage): Promise<void> {
    // Analyze message context before processing
    const detectedContexts = await this.detectContext(message);
    
    // Update active contexts
    this.activeContexts = new Set([...this.activeContexts, ...detectedContexts]);

    // Store context pattern
    await this.storeContextPattern({
      trigger: message.type,
      context: Array.from(this.activeContexts).join(','),
      confidence: 0.8,
      action: 'message_handling',
      outcome: 'pending',
      timestamp: new Date()
    });

    // Process message with context awareness
    await super.handleMessage(message);
  }

  /**
   * Detect context from a message
   */
  private async detectContext(message: AgentMessage): Promise<Set<string>> {
    const contexts = new Set<string>();

    // Add user role context
    if (message.context?.metadata?.userRole) {
      contexts.add(`role:${message.context.metadata.userRole}`);
    }

    // Add time-based context
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) contexts.add('time:night');
    else if (hour < 12) contexts.add('time:morning');
    else if (hour < 17) contexts.add('time:afternoon');
    else contexts.add('time:evening');

    // Add interaction context
    if (message.type.includes('urgent')) contexts.add('priority:high');
    if (message.content?.mood) contexts.add(`mood:${message.content.mood}`);

    return contexts;
  }

  /**
   * Store a new context pattern
   */
  private async storeContextPattern(pattern: ContextPattern): Promise<void> {
    await this.contextMemory.save(
      'global',
      this.name,
      'context_pattern',
      pattern,
      { importance: pattern.confidence }
    );
  }

  /**
   * Override task processing with context awareness
   */
  protected async processTask(task: AgentTask): Promise<any> {
    // Add task-specific contexts
    const taskContexts = await this.detectContext({
      ...task,
      type: task.type,
      context: task.context
    } as AgentMessage);

    // Update active contexts
    this.activeContexts = new Set([...this.activeContexts, ...taskContexts]);

    // Store pre-task context pattern
    const prePattern: ContextPattern = {
      trigger: task.type,
      context: Array.from(this.activeContexts).join(','),
      confidence: 0.9,
      action: 'task_start',
      outcome: 'pending',
      timestamp: new Date()
    };
    await this.storeContextPattern(prePattern);

    try {
      // Process task (to be implemented by specific agents)
      const result = await this.handleContextAwareTask(task);

      // Store successful pattern
      await this.storeContextPattern({
        ...prePattern,
        action: 'task_complete',
        outcome: 'success'
      });

      return result;
    } catch (error) {
      // Store failure pattern
      await this.storeContextPattern({
        ...prePattern,
        action: 'task_complete',
        outcome: 'failure',
        confidence: 0.7
      });
      throw error;
    }
  }

  /**
   * Handle a task with context awareness
   */
  protected async handleContextAwareTask(task: AgentTask): Promise<any> {
    // Customize based on active contexts
    const contextualizedTask = this.adaptTaskToContext(task);
    
    // Get relevant patterns for current contexts
    const patterns = await this.contextMemory.search(
      Array.from(this.activeContexts).join(' '),
      'global',
      this.name,
      'context_pattern'
    );

    // Apply learned patterns to task handling
    const adaptedTask = this.applyPatterns(contextualizedTask, patterns);

    // Implement actual task processing in derived classes
    return adaptedTask;
  }

  /**
   * Adapt a task based on current context
   */
  private adaptTaskToContext(task: AgentTask): AgentTask {
    const adaptedTask = { ...task };

    // Adjust priority based on context
    if (this.activeContexts.has('priority:high')) {
      adaptedTask.priority = Math.min(10, task.priority + 2);
    }

    // Adjust input based on user role
    for (const context of this.activeContexts) {
      if (context.startsWith('role:')) {
        adaptedTask.input = {
          ...task.input,
          userRole: context.split(':')[1]
        };
      }
    }

    return adaptedTask;
  }

  /**
   * Apply learned patterns to a task
   */
  private applyPatterns(task: AgentTask, patterns: any[]): AgentTask {
    const modifiedTask = { ...task };

    // Apply relevant patterns based on scores
    for (const pattern of patterns) {
      const score = this.contextScores.get(pattern.trigger);
      if (score && score.score > 0.7) {
        // Apply high-scoring pattern modifications
        modifiedTask.input = {
          ...modifiedTask.input,
          learnedPattern: pattern.content
        };
      }
    }

    return modifiedTask;
  }

  /**
   * Get current context information
   */
  async getContextInfo(): Promise<{
    active: string[];
    patterns: ContextPattern[];
    scores: Map<string, ContextScore>;
  }> {
    const patterns = await this.contextMemory.search(
      'context_pattern',
      'global',
      this.name,
      'context_pattern'
    );

    return {
      active: Array.from(this.activeContexts),
      patterns: patterns.map(p => p.content),
      scores: this.contextScores
    };
  }
}
