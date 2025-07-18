import { VectorStore } from './vector-store';
import { TreeRings } from './tree-rings';
import { RealtimeClient } from '@supabase/supabase-js';
import EventEmitter from 'events';

interface MemoryManagerOptions {
  vectorStore: VectorStore;
  treeRings: TreeRings;
  realtime?: RealtimeClient;
}

interface RecallOptions {
  query: string;
  context?: string[];
  timeRange?: {
    start: Date;
    end: Date;
  };
}

export class MemoryManager extends EventEmitter {
  private vectorStore: VectorStore;
  private treeRings: TreeRings;
  private realtime?: RealtimeClient;

  constructor(options: MemoryManagerOptions) {
    super();
    this.vectorStore = options.vectorStore;
    this.treeRings = options.treeRings;
    this.realtime = options.realtime;
  }

  async store(memory: any): Promise<void> {
    await this.vectorStore.addDocument(memory);
    await this.treeRings.add(memory);

    if (this.realtime) {
      this.emit('update', memory);
    }
  }

  async get(id: string): Promise<any> {
    return this.vectorStore.getDocument(id);
  }

  async access(id: string): Promise<void> {
    const memory = await this.get(id);
    memory.importance = Math.min(1.0, memory.importance + 0.1);
    await this.update(id, memory);
  }

  async update(id: string, updates: any): Promise<void> {
    await this.vectorStore.updateDocument(id, updates);
    
    if (this.realtime) {
      const updated = await this.get(id);
      this.emit('update', updated);
    }
  }

  async recall(options: RecallOptions): Promise<any[]> {
    const results = await Promise.all([
      this.vectorStore.search(options.query, { context: options.context }),
      options.timeRange ? 
        this.treeRings.getTimeWindow(options.timeRange.start, options.timeRange.end) :
        []
    ]);

    // Combine and rank results
    const [semantic, temporal] = results;
    const combined = [...semantic];

    // Add temporal results that aren't already included
    for (const memory of temporal) {
      if (!combined.find(m => m.id === memory.id)) {
        combined.push(memory);
      }
    }

    // Sort by importance and recency
    return combined.sort((a, b) => {
      const importanceWeight = 0.7;
      const recencyWeight = 0.3;

      const importanceDiff = (b.importance - a.importance) * importanceWeight;
      const recencyDiff = (new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) * recencyWeight;

      return importanceDiff + recencyDiff;
    });
  }

  subscribe(id: string, callback: (memory: any) => void): void {
    this.on(`update:${id}`, callback);
  }

  unsubscribe(id: string, callback: (memory: any) => void): void {
    this.off(`update:${id}`, callback);
  }
}
