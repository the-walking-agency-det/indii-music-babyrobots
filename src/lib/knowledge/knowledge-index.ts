import { PrismaClient } from '@prisma/client';
import { TreeRingsMemory } from '../memory/tree-rings';
import { VectorStore } from './vector-store';
import { SemanticChunker } from '../memory/semantic-chunker';

interface KnowledgeNode {
  id: string;
  type: string;
  content: any;
  metadata: Record<string, any>;
  parents: string[];
  children: string[];
  vectorId?: string;
  timestamp: Date;
  version: number;
}

interface IndexQuery {
  type?: string;
  metadata?: Record<string, any>;
  textQuery?: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
}

export class KnowledgeIndex {
  private static instance: KnowledgeIndex;
  private prisma: PrismaClient;
  private memory: TreeRingsMemory;
  private vectorStore: VectorStore;
  private chunker: SemanticChunker;

  private constructor() {
    this.prisma = new PrismaClient();
    this.memory = new TreeRingsMemory();
    this.vectorStore = VectorStore.getInstance();
    this.chunker = new SemanticChunker();
  }

  public static getInstance(): KnowledgeIndex {
    if (!KnowledgeIndex.instance) {
      KnowledgeIndex.instance = new KnowledgeIndex();
    }
    return KnowledgeIndex.instance;
  }

  /**
   * Add knowledge node to index
   */
  async addNode(
    type: string,
    content: any,
    metadata: Record<string, any> = {},
    parents: string[] = []
  ): Promise<string> {
    const nodeId = crypto.randomUUID();
    const timestamp = new Date();

    // Create vector embedding if content is text
    let vectorId: string | undefined;
    if (typeof content === 'string') {
      vectorId = await this.vectorStore.addDocument(content, {
        nodeId,
        type,
        ...metadata
      });
    }

    const node: KnowledgeNode = {
      id: nodeId,
      type,
      content,
      metadata,
      parents,
      children: [],
      vectorId,
      timestamp,
      version: 1
    };

    // Store in database
    await this.prisma.knowledgeNode.create({
      data: node
    });

    // Update parent-child relationships
    await Promise.all(parents.map(parentId =>
      this.prisma.knowledgeNode.update({
        where: { id: parentId },
        data: {
          children: {
            push: nodeId
          }
        }
      })
    ));

    // Store in memory
    await this.memory.store(
      node,
      ['knowledge', type, ...Object.values(metadata)],
      0.6
    );

    return nodeId;
  }

  /**
   * Update existing node
   */
  async updateNode(
    nodeId: string,
    updates: {
      content?: any;
      metadata?: Record<string, any>;
      parents?: string[];
    }
  ): Promise<void> {
    const node = await this.prisma.knowledgeNode.findUnique({
      where: { id: nodeId }
    });

    if (!node) throw new Error(`Node ${nodeId} not found`);

    const updatedNode = {
      ...node,
      ...updates,
      version: node.version + 1,
      timestamp: new Date()
    };

    // Update vector if content changed and is text
    if (updates.content && typeof updates.content === 'string') {
      if (node.vectorId) {
        await this.vectorStore.deleteDocument(node.vectorId);
      }
      updatedNode.vectorId = await this.vectorStore.addDocument(
        updates.content,
        {
          nodeId,
          type: node.type,
          ...updatedNode.metadata
        }
      );
    }

    // Update in database
    await this.prisma.knowledgeNode.update({
      where: { id: nodeId },
      data: updatedNode
    });

    // Update parent-child relationships if parents changed
    if (updates.parents) {
      // Remove from old parents' children
      await Promise.all(node.parents.map(parentId =>
        this.prisma.knowledgeNode.update({
          where: { id: parentId },
          data: {
            children: {
              set: node.children.filter(id => id !== nodeId)
            }
          }
        })
      ));

      // Add to new parents' children
      await Promise.all(updates.parents.map(parentId =>
        this.prisma.knowledgeNode.update({
          where: { id: parentId },
          data: {
            children: {
              push: nodeId
            }
          }
        })
      ));
    }

    // Update in memory
    await this.memory.store(
      updatedNode,
      ['knowledge', node.type, ...Object.values(updatedNode.metadata)],
      0.6
    );
  }

  /**
   * Delete node and its relationships
   */
  async deleteNode(nodeId: string): Promise<void> {
    const node = await this.prisma.knowledgeNode.findUnique({
      where: { id: nodeId }
    });

    if (!node) return;

    // Delete vector if exists
    if (node.vectorId) {
      await this.vectorStore.deleteDocument(node.vectorId);
    }

    // Update parent-child relationships
    await Promise.all([
      // Remove from parents' children
      ...node.parents.map(parentId =>
        this.prisma.knowledgeNode.update({
          where: { id: parentId },
          data: {
            children: {
              set: node.children.filter(id => id !== nodeId)
            }
          }
        })
      ),
      // Remove from children's parents
      ...node.children.map(childId =>
        this.prisma.knowledgeNode.update({
          where: { id: childId },
          data: {
            parents: {
              set: node.parents.filter(id => id !== nodeId)
            }
          }
        })
      )
    ]);

    // Delete from database
    await this.prisma.knowledgeNode.delete({
      where: { id: nodeId }
    });
  }

  /**
   * Search knowledge index
   */
  async search(query: IndexQuery): Promise<KnowledgeNode[]> {
    let nodes: KnowledgeNode[] = [];

    // Search by vector similarity if text query provided
    if (query.textQuery) {
      const vectorResults = await this.vectorStore.search(query.textQuery);
      const nodeIds = vectorResults.map(r => r.document.metadata.nodeId);
      nodes = await this.prisma.knowledgeNode.findMany({
        where: {
          id: {
            in: nodeIds
          }
        }
      }) as KnowledgeNode[];
    }
    // Otherwise search by metadata and type
    else {
      nodes = await this.prisma.knowledgeNode.findMany({
        where: {
          type: query.type,
          metadata: query.metadata,
          timestamp: {
            gte: query.timeRange?.start,
            lte: query.timeRange?.end
          }
        }
      }) as KnowledgeNode[];
    }

    return nodes;
  }

  /**
   * Get node by ID
   */
  async getNode(nodeId: string): Promise<KnowledgeNode | null> {
    return await this.prisma.knowledgeNode.findUnique({
      where: { id: nodeId }
    }) as KnowledgeNode | null;
  }

  /**
   * Get node's children
   */
  async getChildren(nodeId: string): Promise<KnowledgeNode[]> {
    const node = await this.getNode(nodeId);
    if (!node) return [];

    return await this.prisma.knowledgeNode.findMany({
      where: {
        id: {
          in: node.children
        }
      }
    }) as KnowledgeNode[];
  }

  /**
   * Get node's parents
   */
  async getParents(nodeId: string): Promise<KnowledgeNode[]> {
    const node = await this.getNode(nodeId);
    if (!node) return [];

    return await this.prisma.knowledgeNode.findMany({
      where: {
        id: {
          in: node.parents
        }
      }
    }) as KnowledgeNode[];
  }

  /**
   * Get all nodes of a specific type
   */
  async getNodesByType(type: string): Promise<KnowledgeNode[]> {
    return await this.prisma.knowledgeNode.findMany({
      where: { type }
    }) as KnowledgeNode[];
  }

  /**
   * Get node version history
   */
  async getNodeHistory(nodeId: string): Promise<KnowledgeNode[]> {
    return await this.prisma.knowledgeNode.findMany({
      where: { id: nodeId },
      orderBy: {
        version: 'desc'
      }
    }) as KnowledgeNode[];
  }
}
