import { TreeRingsMemory } from './tree-rings';
import { VectorStore } from '../knowledge/vector-store';
import { AgentMessage, AgentTask } from '../agents/base-agent';

export class AgentMemoryManager {
  private treeRings: TreeRingsMemory;
  private vectorStore: VectorStore;
  private agentId: string;

  constructor(agentId: string) {
    this.agentId = agentId;
    this.treeRings = new TreeRingsMemory();
    this.vectorStore = VectorStore.getInstance();
  }

  /**
   * Store information in both memory systems
   */
  async store(data: any, tags: string[], importance: number): Promise<void> {
    // Store in tree rings for temporal/tagged access
    await this.treeRings.store(data, tags, importance);

    // Store in vector store for semantic search
    let content = '';
    let metadata: Record<string, any> = {
      agentId: this.agentId,
      tags,
      importance,
      timestamp: new Date()
    };

    // Convert different data types to storable format
    if (data.content) {
      content = typeof data.content === 'string' ? data.content : JSON.stringify(data.content);
      metadata = { ...metadata, ...this.extractMetadata(data) };
    } else {
      content = typeof data === 'string' ? data : JSON.stringify(data);
    }

    await this.vectorStore.addDocument(content, metadata);
  }

  /**
   * Search through memories semantically
   */
  async searchMemories(query: string, topK: number = 5): Promise<any[]> {
    // Search in vector store
    const results = await this.vectorStore.search(query, topK);
    
    // Filter for this agent's memories
    return results
      .filter(result => result.document.metadata.agentId === this.agentId)
      .map(result => ({
        content: result.document.content,
        metadata: result.document.metadata,
        relevance: result.score
      }));
  }

  /**
   * Get recent memories from tree rings
   */
  async getRecentMemories(tags?: string[]): Promise<any[]> {
    // Search for memories with given tags
    if (tags && tags.length > 0) {
      return this.treeRings.query({
        context: tags,
        limit: 10
      });
    }
    
    // If no tags, get most recently accessed memories
    return this.treeRings.query({
      limit: 10
    });
  }

  /**
   * Extract metadata from different types of data
   */
  private extractMetadata(data: any): Record<string, any> {
    if (this.isAgentMessage(data)) {
      return {
        type: 'message',
        messageType: data.type,
        from: data.from,
        to: data.to,
        context: data.context
      };
    }
    
    if (this.isAgentTask(data)) {
      return {
        type: 'task',
        taskType: data.type,
        priority: data.priority,
        context: data.context
      };
    }

    return {};
  }

  /**
   * Type guards
   */
  private isAgentMessage(data: any): data is AgentMessage {
    return data && 'type' in data && 'from' in data && 'to' in data;
  }

  private isAgentTask(data: any): data is AgentTask {
    return data && 'type' in data && 'priority' in data && 'input' in data;
  }

  /**
   * Learn from experience by analyzing patterns in memories
   */
  async learn(): Promise<void> {
    // Get recent memories
    const recentMemories = await this.searchMemories('', 100);
    
    // Analyze patterns (placeholder implementation)
    const patterns = this.analyzePatterns(recentMemories);
    
    // Store learned patterns
    await this.store(
      { type: 'learned_pattern', patterns },
      ['learning', 'pattern'],
      0.8
    );
  }

  /**
   * Analyze patterns in memories (placeholder implementation)
   */
  private analyzePatterns(memories: any[]): any[] {
    // TODO: Implement pattern analysis
    // This could include:
    // - Common sequences of actions
    // - Frequent co-occurring tags
    // - Success/failure patterns in tasks
    // - Communication patterns with other agents
    return [];
  }
}
