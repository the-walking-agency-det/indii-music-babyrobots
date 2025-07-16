import { PrismaClient } from '@prisma/client';
import { TreeRingsMemory } from '../memory/tree-rings';
import { SemanticChunker } from '../memory/semantic-chunker';
import { encode } from 'gpt-3-encoder';

interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
  timestamp: Date;
}

interface SearchResult {
  document: VectorDocument;
  score: number;
}

export class VectorStore {
  private static instance: VectorStore;
  private prisma: PrismaClient;
  private memory: TreeRingsMemory;
  private chunker: SemanticChunker;

  private constructor() {
    this.prisma = new PrismaClient();
    this.memory = new TreeRingsMemory();
    this.chunker = new SemanticChunker();
  }

  public static getInstance(): VectorStore {
    if (!VectorStore.instance) {
      VectorStore.instance = new VectorStore();
    }
    return VectorStore.instance;
  }

  /**
   * Add document to vector store
   */
  async addDocument(content: string, metadata: Record<string, any> = {}): Promise<string> {
    // Chunk content if needed
    const chunks = this.chunker.chunk(content);
    
    // Get embeddings for chunks
    const embeddedChunks = await this.embedChunks(chunks);

    // Store chunks with embeddings
    const documentId = crypto.randomUUID();
    await Promise.all(embeddedChunks.map(async (chunk, index) => {
      const vectorDoc: VectorDocument = {
        id: `${documentId}_${index}`,
        content: chunk.text,
        embedding: chunk.embedding!,
        metadata: {
          ...metadata,
          documentId,
          chunkIndex: index
        },
        timestamp: new Date()
      };

      await this.storeVector(vectorDoc);
    }));

    return documentId;
  }

  /**
   * Search for similar documents
   */
  async search(query: string, topK: number = 5): Promise<SearchResult[]> {
    // Get query embedding
    const queryEmbedding = await this.getEmbedding(query);

    // Search in vector store
    const results = await this.prisma.vectorDocument.findMany({
      take: topK * 2  // Get more for post-processing
    });

    // Calculate similarities and sort
    const scored = results.map(doc => ({
      document: doc as VectorDocument,
      score: this.cosineSimilarity(queryEmbedding, doc.embedding)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

    return scored;
  }

  /**
   * Delete document and its chunks
   */
  async deleteDocument(documentId: string): Promise<void> {
    await this.prisma.vectorDocument.deleteMany({
      where: {
        metadata: {
          path: ['documentId'],
          equals: documentId
        }
      }
    });
  }

  /**
   * Update document metadata
   */
  async updateMetadata(documentId: string, metadata: Record<string, any>): Promise<void> {
    await this.prisma.vectorDocument.updateMany({
      where: {
        metadata: {
          path: ['documentId'],
          equals: documentId
        }
      },
      data: {
        metadata: {
          ...metadata,
          documentId  // Preserve documentId
        }
      }
    });
  }

  /**
   * Store vector in database and memory
   */
  private async storeVector(vectorDoc: VectorDocument): Promise<void> {
    // Store in database
    await this.prisma.vectorDocument.create({
      data: vectorDoc
    });

    // Store in memory system
    await this.memory.store(
      vectorDoc,
      ['vector', ...Object.values(vectorDoc.metadata)],
      0.6
    );
  }

  /**
   * Get embedding for text using preferred model
   */
  private async getEmbedding(text: string): Promise<number[]> {
    // TODO: Replace with actual embedding model call
    // For now, return random embedding
    return Array.from({ length: 1536 }, () => Math.random());
  }

  /**
   * Embed multiple chunks
   */
  private async embedChunks(chunks: { text: string }[]): Promise<{ text: string; embedding: number[] }[]> {
    return Promise.all(
      chunks.map(async chunk => ({
        text: chunk.text,
        embedding: await this.getEmbedding(chunk.text)
      }))
    );
  }

  /**
   * Calculate cosine similarity between vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (normA * normB);
  }

  /**
   * Get document by ID
   */
  async getDocument(documentId: string): Promise<VectorDocument[]> {
    return await this.prisma.vectorDocument.findMany({
      where: {
        metadata: {
          path: ['documentId'],
          equals: documentId
        }
      },
      orderBy: {
        metadata: {
          path: ['chunkIndex']
        }
      }
    }) as VectorDocument[];
  }

  /**
   * List all documents (metadata only)
   */
  async listDocuments(): Promise<Record<string, any>[]> {
    const docs = await this.prisma.vectorDocument.findMany({
      distinct: ['metadata.documentId'],
      select: {
        metadata: true
      }
    });

    return docs.map(d => d.metadata);
  }

  /**
   * Clear vector store
   */
  async clear(): Promise<void> {
    await this.prisma.vectorDocument.deleteMany({});
  }
}
