import { TreeRingsMemory } from '../../lib/memory/tree-rings';
import { SemanticChunker } from '../../lib/memory/semantic-chunker';
import { MockPrismaClient } from './prisma';

export class MockVectorStore {
  private static _instance: MockVectorStore | null = null;
  private prisma: MockPrismaClient;
  private memory: TreeRingsMemory;
  private chunker: SemanticChunker;
  private store: Map<string, any> = new Map();

  private constructor() {
    this.prisma = new MockPrismaClient();
    this.memory = new TreeRingsMemory();
    this.chunker = new SemanticChunker();
  }

  public static getInstance(): MockVectorStore {
    if (!MockVectorStore._instance) {
      MockVectorStore._instance = new MockVectorStore();
    }
    return MockVectorStore._instance;
  }

  public static tearDown(): void {
    MockVectorStore._instance = null;
  }

  async addDocument(content: string, metadata: Record<string, any> = {}): Promise<string> {
    const documentId = crypto.randomUUID();
    const chunks = this.chunker.chunk(content);
    
    for (const [index, chunk] of chunks.entries()) {
      const id = `${documentId}_${index}`;
      this.store.set(id, {
        id,
        content: chunk.text,
        embedding: Array.from({ length: 1536 }, () => Math.random()),
        metadata: {
          ...metadata,
          documentId,
          chunkIndex: index
        },
        timestamp: new Date()
      });
    }

    return documentId;
  }

  async search(query: string, topK: number = 5): Promise<any[]> {
    const docs = Array.from(this.store.values());
    return docs
      .map(doc => ({
        document: doc,
        score: Math.random()  // Mock similarity score
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  async deleteDocument(documentId: string): Promise<void> {
    for (const [id, doc] of this.store.entries()) {
      if (doc.metadata.documentId === documentId) {
        this.store.delete(id);
      }
    }
  }

  async updateMetadata(documentId: string, metadata: Record<string, any>): Promise<void> {
    for (const [id, doc] of this.store.entries()) {
      if (doc.metadata.documentId === documentId) {
        doc.metadata = {
          ...metadata,
          documentId
        };
      }
    }
  }

  async getDocument(documentId: string): Promise<any[]> {
    return Array.from(this.store.values())
      .filter(doc => doc.metadata.documentId === documentId)
      .sort((a, b) => a.metadata.chunkIndex - b.metadata.chunkIndex);
  }

  async listDocuments(): Promise<Record<string, any>[]> {
    const documents = new Map<string, Record<string, any>>();
    for (const doc of this.store.values()) {
      if (!documents.has(doc.metadata.documentId)) {
        documents.set(doc.metadata.documentId, doc.metadata);
      }
    }
    return Array.from(documents.values());
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}
