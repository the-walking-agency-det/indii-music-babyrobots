import { PrismaClient } from '@prisma/client';
import { SemanticChunker } from './semantic-chunker';

export interface MemoryRing {
  id: string;
  level: number;          // Ring level (0 = core, increases outward)
  timestamp: Date;        // When this memory was created
  content: any;           // The actual memory content
  context: string[];      // Associated context tags
  references: string[];   // Related memory IDs
  importance: number;     // 0-1 importance score
  accessCount: number;    // How often this memory is accessed
  lastAccessed: Date;    // Last access timestamp
}

export interface MemoryQuery {
  context?: string[];
  timeRange?: {
    start: Date;
    end: Date;
  };
  importance?: number;
  limit?: number;
}

export class TreeRingsMemory {
  private prisma: PrismaClient;
  private chunker: SemanticChunker;
  private rings: Map<number, MemoryRing[]>;

  constructor() {
    this.prisma = new PrismaClient();
    this.chunker = new SemanticChunker();
    this.rings = new Map();
  }

  /**
   * Stores a new memory in the appropriate ring
   */
  async store(content: any, context: string[], importance: number = 0.5): Promise<MemoryRing> {
    const ring: MemoryRing = {
      id: crypto.randomUUID(),
      level: this.calculateRingLevel(importance),
      timestamp: new Date(),
      content,
      context,
      references: [],
      importance,
      accessCount: 0,
      lastAccessed: new Date()
    };

    // Store in both in-memory and persistent storage
    await this.prisma.memory.create({
      data: {
        id: ring.id,
        level: ring.level,
        timestamp: ring.timestamp,
        content: JSON.stringify(content),
        context: context,
        references: ring.references,
        importance: ring.importance,
        accessCount: ring.accessCount,
        lastAccessed: ring.lastAccessed
      }
    });

    if (!this.rings.has(ring.level)) {
      this.rings.set(ring.level, []);
    }
    this.rings.get(ring.level)?.push(ring);

    return ring;
  }

  /**
   * Retrieves memories based on query parameters
   */
  async query(params: MemoryQuery): Promise<MemoryRing[]> {
    const memories = await this.prisma.memory.findMany({
      where: {
        context: {
          hasSome: params.context
        },
        timestamp: {
          gte: params.timeRange?.start,
          lte: params.timeRange?.end
        },
        importance: {
          gte: params.importance
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: params.limit
    });

    return memories.map(m => ({
      ...m,
      content: JSON.parse(m.content as string)
    }));
  }

  /**
   * Updates an existing memory
   */
  async update(id: string, updates: Partial<MemoryRing>): Promise<MemoryRing> {
    const updated = await this.prisma.memory.update({
      where: { id },
      data: {
        ...updates,
        content: updates.content ? JSON.stringify(updates.content) : undefined,
        lastAccessed: new Date()
      }
    });

    return {
      ...updated,
      content: JSON.parse(updated.content as string)
    };
  }

  /**
   * Calculates which ring a memory belongs in based on importance
   */
  private calculateRingLevel(importance: number): number {
    if (importance >= 0.8) return 0;  // Core ring
    if (importance >= 0.6) return 1;  // First growth ring
    if (importance >= 0.4) return 2;  // Second growth ring
    if (importance >= 0.2) return 3;  // Third growth ring
    return 4;                         // Outer ring
  }

  /**
   * Prunes old, less important memories from outer rings
   */
  async prune(): Promise<void> {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 30);  // Keep last 30 days

    await this.prisma.memory.deleteMany({
      where: {
        AND: [
          { level: { gt: 2 } },           // Only prune outer rings
          { importance: { lt: 0.3 } },    // Only low importance
          { lastAccessed: { lt: threshold } }
        ]
      }
    });
  }

  /**
   * Links related memories together
   */
  async link(memoryId: string, referenceIds: string[]): Promise<void> {
    await this.prisma.memory.update({
      where: { id: memoryId },
      data: {
        references: referenceIds
      }
    });
  }

  /**
   * Retrieves all memories in a specific ring level
   */
  async getRing(level: number): Promise<MemoryRing[]> {
    const memories = await this.prisma.memory.findMany({
      where: { level }
    });

    return memories.map(m => ({
      ...m,
      content: JSON.parse(m.content as string)
    }));
  }
}
