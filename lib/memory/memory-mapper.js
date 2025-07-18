// lib/memory/memory-mapper.js
import { VectorStore } from '../mocks/index.js';
import fs from 'fs/promises';
import path from 'path';

export class MemoryMapper {
  constructor(agentType, vectorStore = new VectorStore()) {
    this.agentType = agentType;
    this.vectorStore = vectorStore;
    this.contextCache = new Map();
    this.cacheDir = path.join(process.cwd(), '.memory_cache', agentType);
    this.initCacheDir();
  }

  async initCacheDir() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create memory cache directory:', error);
    }
  }

  async mapMemory(query, currentContext, persona, capabilities) {
    const cacheKey = JSON.stringify({ query, agentType: this.agentType });
    
    // Try in-memory cache first
    if (this.contextCache.has(cacheKey)) {
      const { value, expiry } = this.contextCache.get(cacheKey);
      if (expiry && Date.now() < expiry) {
        console.log(`MemoryMapper: In-memory cache hit for query "${query}"`);
        return value;
      } else {
        console.log(`MemoryMapper: In-memory cache expired for query "${query}"`);
        this.contextCache.delete(cacheKey);
      }
    }

    // Try file system cache
    const filePath = path.join(this.cacheDir, `${cacheKey}.json`);
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      const { value, expiry } = JSON.parse(fileContent);
      if (expiry && Date.now() < expiry) {
        console.log(`MemoryMapper: File system cache hit for query "${query}"`);
        this.contextCache.set(cacheKey, value); // Populate in-memory cache
        return value;
      } else {
        console.log(`MemoryMapper: File system cache expired for query "${query}"`);
        await fs.unlink(filePath); // Delete expired cache
        this.contextCache.delete(cacheKey); // Also delete from in-memory cache
      }
    } catch (error) {
      // File not found or other error, treat as cache miss
      console.log(`MemoryMapper: File system cache miss for query "${query}"`);
    }

    // Map memory to agent context
    const relevantMemories = await this.vectorStore.search(query);
    const mappedContext = this.buildContext(relevantMemories, currentContext, persona, capabilities);
    
    this.contextCache.set(cacheKey, mappedContext); // Set in-memory cache

    // Set in file system cache (with a default TTL of 5 minutes)
    const ttl = 300; 
    const expiry = ttl ? Date.now() + ttl * 1000 : null;
    try {
      await fs.writeFile(filePath, JSON.stringify({ value: mappedContext, expiry }), 'utf8');
      console.log(`MemoryMapper: Stored query "${query}" in file system cache.`);
    } catch (error) {
      console.error(`MemoryMapper: Failed to write to file system cache for query "${query}":`, error);
    }

    return mappedContext;
  }

  buildContext(memories, currentContext, persona, capabilities) {
    // Build agent-specific context
    return {
      persona: persona,
      knowledge: memories,
      currentContext,
      capabilities: capabilities
    };
  }
}
