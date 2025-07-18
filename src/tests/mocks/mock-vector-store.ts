import { vi } from 'vitest';

export class MockVectorStore {
  private static instance: MockVectorStore | null = null;
  private embeddings: Map<string, number[]>;
  private metadata: Map<string, any>;

  private constructor() {
    this.embeddings = new Map();
    this.metadata = new Map();
  }

  static getInstance(): MockVectorStore {
    if (!MockVectorStore.instance) {
      MockVectorStore.instance = new MockVectorStore();
    }
    return MockVectorStore.instance;
  }

  static tearDown() {
    MockVectorStore.instance = null;
  }

  async store(id: string, vector: number[], metadata?: any): Promise<void> {
    this.embeddings.set(id, vector);
    if (metadata) {
      this.metadata.set(id, metadata);
    }
  }

  async search(queryVector: number[], limit: number = 10): Promise<Array<{ document: { content: string; metadata: any }; score: number }>> {
    // Simple mock implementation - returns all stored vectors sorted by a random similarity score
    const results = Array.from(this.embeddings.entries()).map(([id, vector]) => ({
      document: {
        content: String(vector),
        metadata: this.metadata.get(id)
      },
      score: Math.random() // Mock similarity score
    }));
    
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  async delete(id: string): Promise<void> {
    this.embeddings.delete(id);
    this.metadata.delete(id);
  }

  async clear(): Promise<void> {
    this.embeddings.clear();
    this.metadata.clear();
  }
}

// Create spies for testing
export const mockVectorStoreSpy = {
  store: vi.spyOn(MockVectorStore.prototype, 'store'),
  search: vi.spyOn(MockVectorStore.prototype, 'search'),
  delete: vi.spyOn(MockVectorStore.prototype, 'delete'),
  clear: vi.spyOn(MockVectorStore.prototype, 'clear')
};
