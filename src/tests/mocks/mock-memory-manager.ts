import { AgentMessage, AgentTask } from '../../lib/agents/base-agent';

interface StoredMemory {
  content: any;
  metadata: {
    agentId: string;
    tags: string[];
    importance: number;
    timestamp: Date;
    type?: string;
  };
}

export class MockMemoryManager {
  private memories: StoredMemory[] = [];
  private agentId: string;

  constructor(agentId: string) {
    this.agentId = agentId;
  }

  async store(data: any, tags: string[], importance: number): Promise<void> {
    let content = '';
    let metadata = {
      agentId: this.agentId,
      tags,
      importance,
      timestamp: new Date()
    };

    if (this.isAgentMessage(data)) {
      content = data.content;
      metadata = {
        ...metadata,
        type: 'message',
        messageType: data.type,
        from: data.from,
        to: data.to
      };
    } else if (this.isAgentTask(data)) {
      content = data.input;
      metadata = {
        ...metadata,
        type: 'task',
        taskType: data.type,
        priority: data.priority
      };
    } else if (data.content) {
      content = typeof data.content === 'string' ? data.content : JSON.stringify(data.content);
      metadata = { ...metadata, ...data };
    } else {
      content = typeof data === 'string' ? data : JSON.stringify(data);
    }

    this.memories.push({ content, metadata });
  }

  async searchMemories(query: string, limit: number = 5): Promise<any[]> {
    // Split query into keywords
    const keywords = query.toLowerCase().split(/\s+/);
    
    // Calculate relevance scores based on keyword matches
    const scored = this.memories.map(memory => {
      const contentStr = typeof memory.content === 'string' 
        ? memory.content.toLowerCase()
        : JSON.stringify(memory.content).toLowerCase();
      const metadataStr = JSON.stringify(memory.metadata).toLowerCase();
      
      // Score based on content matches
      const contentScore = keywords.reduce((score, keyword) => {
        if (contentStr.includes(keyword)) score += 1;
        // Partial word matches get partial score
        else if ([...contentStr.matchAll(/\w+/g)].some(match => 
          match[0].includes(keyword) || keyword.includes(match[0])
        )) score += 0.5;
        return score;
      }, 0) / keywords.length;

      // Score based on metadata matches
      const metadataScore = keywords.reduce((score, keyword) => {
        if (metadataStr.includes(keyword)) score += 1;
        return score;
      }, 0) / keywords.length;

      // Score based on tag matches
      const tagScore = memory.metadata.tags.reduce((score, tag) => {
        if (keywords.some(k => tag.toLowerCase().includes(k))) score += 1;
        return score;
      }, 0) / keywords.length;

      // Combine scores with weights
      const totalScore = (contentScore * 0.5) + (metadataScore * 0.3) + (tagScore * 0.2);

      // Boost score for exact matches of special queries
      if (query === 'learned_pattern' && memory.metadata.type === 'learned_pattern') {
        return {
          memory,
          score: 1.0  // Ensure learned patterns appear first when specifically queried
        };
      }

      return {
        memory,
        score: totalScore
      };
    });

    // Filter and sort by relevance
    return scored
      .filter(item => item.score > 0.1) // Minimum relevance threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => ({
        content: item.memory.content,
        metadata: item.memory.metadata,
        relevance: item.score
      }));
  }

  async getRecentMemories(tags?: string[]): Promise<any[]> {
    let filtered = this.memories;
    
    if (tags && tags.length > 0) {
      filtered = this.memories.filter(memory =>
        tags.some(tag => memory.metadata.tags.includes(tag))
      );
    }

    return filtered
      .sort((a, b) => b.metadata.timestamp.getTime() - a.metadata.timestamp.getTime())
      .slice(0, 10)
      .map(memory => ({
        content: memory.content,
        metadata: memory.metadata
      }));
  }

  async learn(): Promise<void> {
    // Mock learning implementation
    const recentMemories = await this.getRecentMemories();
    const patterns = this.analyzePatterns(recentMemories);
    
    // Store combined patterns with detailed metadata
    await this.store(
      { 
        type: 'learned_pattern',
        content: JSON.stringify(patterns),
        timestamp: new Date()
      },
      ['learning', 'pattern', ...patterns.map(p => p.type)],
      0.8
    );

    // Also store individual patterns for granular access
    for (const pattern of patterns) {
      await this.store(
        { 
          type: 'learned_pattern',
          pattern_type: pattern.type,
          content: JSON.stringify(pattern),
          timestamp: new Date()
        },
        ['learning', 'pattern', pattern.type],
        0.8
      );
    }
  }

  private analyzePatterns(memories: any[]): any[] {
    // Simple pattern analysis for testing
    const messageTypes = new Set();
    const taskTypes = new Set();
    const timeouts = [];
    const durations = [];
    const processingStats = { success: 0, error: 0, total: 0 };

    for (const memory of memories) {
      if (memory.metadata.type === 'message') {
        messageTypes.add(memory.metadata.messageType);
      } else if (memory.metadata.type === 'task') {
        taskTypes.add(memory.metadata.taskType);
      }

      // Extract timing and processing patterns
      const content = JSON.stringify(memory.content);
      if (content.includes('timeout')) {
        timeouts.push(memory);
      }
      if (content.includes('duration')) {
        durations.push(memory);
      }
      if (content.includes('success')) {
        processingStats.success++;
        processingStats.total++;
      }
      if (content.includes('error')) {
        processingStats.error++;
        processingStats.total++;
      }
    }

    return [
      {
        type: 'communication',
        messageTypes: Array.from(messageTypes),
        taskTypes: Array.from(taskTypes)
      },
      {
        type: 'timing',
        timeoutCount: timeouts.length,
        durationStats: this.analyzeDurations(durations)
      },
      {
        type: 'processing',
        successRate: processingStats.total > 0 ? 
          processingStats.success / processingStats.total : 0,
        errorRate: processingStats.total > 0 ? 
          processingStats.error / processingStats.total : 0,
        timeouts: timeouts.length,
        totalProcessed: processingStats.total
      }
    ];
  }

  private analyzeDurations(memories: any[]): any {
    if (memories.length === 0) return null;

    const durations = memories
      .map(m => m.content.duration)
      .filter(d => typeof d === 'number');

    if (durations.length === 0) return null;

    return {
      min: Math.min(...durations),
      max: Math.max(...durations),
      avg: durations.reduce((a, b) => a + b, 0) / durations.length
    };
  }

  private isAgentMessage(data: any): data is AgentMessage {
    return data && 'type' in data && 'from' in data && 'to' in data;
  }

  private isAgentTask(data: any): data is AgentTask {
    return data && 'type' in data && 'priority' in data && 'input' in data;
  }
}
