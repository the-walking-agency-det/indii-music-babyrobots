import { DatabaseAdapter } from '../db-adapter';

interface TreeRingsOptions {
  adapter: DatabaseAdapter;
  timeWindow?: number;
}

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

export class TreeRings {
  private adapter: DatabaseAdapter;
  private timeWindow: number;

  constructor(options: TreeRingsOptions) {
    this.adapter = options.adapter;
    this.timeWindow = options.timeWindow || 24 * 60 * 60 * 1000; // Default 24 hours
    this.ensureTablesExist().catch(err => {
      console.error('Failed to create tables:', err);
    });
  }

  /**
   * Stores a new memory in the appropriate ring
   */
async add(memory: any): Promise<void> {
    const timestamp = memory.timestamp || new Date();
    await this.adapter.run(
      'INSERT INTO memories (id, content, importance, tags, timestamp) VALUES (?, ?, ?, ?, ?)',
      [memory.id, memory.content, memory.importance, JSON.stringify(memory.tags), timestamp.toISOString()]
    );
  }

  async getRecent(limit: number = 10): Promise<any[]> {
    const results = await this.adapter.query(
      'SELECT * FROM memories ORDER BY timestamp DESC LIMIT ?',
      [limit]
    );

    return results.map(r => ({
      ...r,
      tags: JSON.parse(r.tags)
    }));
  }

  async getTimeWindow(start: Date, end: Date): Promise<any[]> {
    const results = await this.adapter.query(
      'SELECT * FROM memories WHERE timestamp >= ? AND timestamp <= ? ORDER BY timestamp DESC',
      [start.toISOString(), end.toISOString()]
    );

    return results.map(r => ({
      ...r,
      tags: JSON.parse(r.tags)
    }));
  }

  async getByTag(tag: string, limit: number = 10): Promise<any[]> {
    const results = await this.adapter.query(
      'SELECT * FROM memories WHERE tags LIKE ? ORDER BY timestamp DESC LIMIT ?',
      [`%${tag}%`, limit]
    );

    return results.map(r => ({
      ...r,
      tags: JSON.parse(r.tags)
    }));
  }

  async delete(id: string): Promise<void> {
    await this.adapter.run('DELETE FROM memories WHERE id = ?', [id]);
  }

  async clear(): Promise<void> {
    await this.adapter.run('DELETE FROM memories');
  }

  private calculateDecay(timestamp: Date): number {
    const age = Date.now() - timestamp.getTime();
    return Math.max(0, 1 - (age / this.timeWindow));
  }

  private async ensureTablesExist(): Promise<void> {
    // Create memories table if it doesn't exist
    await this.adapter.run(`
      CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        importance REAL DEFAULT 0.5,
        tags TEXT NOT NULL,
        timestamp TEXT NOT NULL
      )
    `);
  }

  async store(content: any, context: string[], importance: number = 0.5): Promise<MemoryRing> {
    const ring: MemoryRing = {
      id: randomUUID(),
      level: this.calculateRingLevel(importance),
      timestamp: new Date(),
      content,
      context,
      references: [],
      importance,
      accessCount: 0,
      lastAccessed: new Date()
    };

    console.time(`MemoryStore_Level_${ring.level}`);
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
    console.timeEnd(`MemoryStore_Level_${ring.level}`);

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
    console.time(`MemoryQuery_Level_${params.importance !== undefined ? this.calculateRingLevel(params.importance) : 'Any'}`);
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
    console.timeEnd(`MemoryQuery_Level_${params.importance !== undefined ? this.calculateRingLevel(params.importance) : 'Any'}`);

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
