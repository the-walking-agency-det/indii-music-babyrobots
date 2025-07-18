// lib/memory/tree-ring-memory.js
import { RushMemory } from '../../src/lib/memory/rush-memory.js';
import { CrashMemory } from '../../src/lib/memory/crash-memory.js';
import { MemoryMapper } from './memory-mapper.js';

export class TreeRingMemory {
  constructor(options = {}) {
    // Configure Rush Memory for sub-100ms access with a 5-minute TTL
    this.rushMemory = new RushMemory({ ttl: 5 * 60 * 1000, ...options.rushMemoryOptions });
    this.crashMemory = new CrashMemory({ apiKey: options.apiKey, ...options.crashMemoryOptions });
    this.memoryMapper = new MemoryMapper(options.agentType, options.vectorStore);
  }

  async save(sessionId, agentId, scope, data, metadata = {}) {
    // Save to Rush Memory for immediate access
    await this.rushMemory.set(sessionId, agentId, scope, data, metadata.ttl, metadata);

    // Save to Crash Memory for persistence
    await this.crashMemory.save(sessionId, agentId, scope, data, metadata);
  }

  async retrieve(sessionId, agentId, scope, limit = 10) {
    // Try to retrieve from Rush Memory first (fastest)
    const rushData = await this.rushMemory.get(sessionId, agentId, scope);
    if (rushData) {
      return rushData;
    }

    // If not in Rush Memory, retrieve from Crash Memory
    const crashData = await this.crashMemory.retrieve(sessionId, agentId, scope, limit);
    if (crashData) {
      // Optionally, re-populate Rush Memory from Crash Memory for future quick access
      await this.rushMemory.set(sessionId, agentId, scope, crashData);
      return crashData;
    }

    return null;
  }

  async search(query, sessionId, agentId, scope, limit = 10) {
    // Semantic search will now leverage CrashMemory's semantic search capabilities
    return this.crashMemory.search(query, sessionId, agentId, scope, limit);
  }

  async getStats() {
    const rushStats = await this.rushMemory.getStats();
    const crashStats = await this.crashMemory.getStats();
    return {
      rushMemory: rushStats,
      crashMemory: crashStats,
    };
  }

  async cleanup() {
    await this.rushMemory.cleanup();
    await this.crashMemory.cleanup();
  }

  destroy() {
    this.rushMemory.destroy();
    // CrashMemory might not have a destroy method, but we should close the DB connection
    // if it's not handled internally. For now, assuming it's handled or not critical.
  }
}
