// lib/mocks/index.js

export class VectorStore {
  async search(query) {
    console.log(`VectorStore: Searching for "${query}"`);
    return [{ id: 'mem1', content: 'Relevant memory 1' }];
  }
}

export class KnowledgeBase {
  // Placeholder for knowledge base interactions
}

export class RateLimiter {
  async checkLimit(apiName) {
    console.log(`RateLimiter: Checking limit for ${apiName}`);
    // Simulate rate limiting logic
  }
}

import fs from 'fs/promises';
import path from 'path';

export class APICache {
  constructor() {
    this.cache = new Map();
    this.cacheDir = path.join(process.cwd(), '.api_cache');
    this.initCacheDir();
  }

  async initCacheDir() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create cache directory:', error);
    }
  }

  async get(key) {
    console.log(`APICache: Getting ${key}`);
    // Try in-memory cache first
    if (this.cache.has(key)) {
      const { value, expiry } = this.cache.get(key);
      if (expiry && Date.now() < expiry) {
        console.log(`APICache: In-memory cache hit for ${key}`);
        return value;
      } else {
        console.log(`APICache: In-memory cache expired for ${key}`);
        this.cache.delete(key);
      }
    }

    // Try file system cache
    const filePath = path.join(this.cacheDir, `${key}.json`);
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      const { value, expiry } = JSON.parse(fileContent);
      if (expiry && Date.now() < expiry) {
        console.log(`APICache: File system cache hit for ${key}`);
        this.cache.set(key, value); // Populate in-memory cache
        return value;
      } else {
        console.log(`APICache: File system cache expired for ${key}`);
        await fs.unlink(filePath); // Delete expired cache
        this.cache.delete(key); // Also delete from in-memory cache
        return null;
      }
    } catch (error) {
      // File not found or other error, treat as cache miss
      console.log(`APICache: File system cache miss for ${key}`);
    }
    return null;
  }

  async set(key, value, ttl = 300) {
    console.log(`APICache: Setting ${key}`);
    const expiry = ttl ? Date.now() + ttl * 1000 : null;
    this.cache.set(key, value); // Set in-memory cache

    // Set in file system cache
    const filePath = path.join(this.cacheDir, `${key}.json`);
    try {
      await fs.writeFile(filePath, JSON.stringify({ value, expiry }), 'utf8');
      console.log(`APICache: Stored ${key} in file system cache`);
    } catch (error) {
      console.error(`APICache: Failed to write to file system cache for ${key}:`, error);
    }
  }
}

export class MCPConnection {
  constructor(endpoint, capabilities) {
    this.endpoint = endpoint;
    this.capabilities = capabilities;
  }
  async initialize() {
    console.log(`MCPConnection: Initializing connection to ${this.endpoint}`);
  }
  async send(message) {
    console.log(`MCPConnection: Sending message to ${this.endpoint}`, message);
    return { status: 'success', response: 'mock_response' };
  }
}

// Mock Supabase client
export const mockSupabase = {
  from: (table) => ({
    select: (columns) => ({
      textSearch: (field, query) => {
        console.log(`Supabase: Searching table "${table}" for "${query}" in "${field}"`);
        return [{ id: 'kb1', content: 'Knowledge base entry' }];
      }
    })
  })
};

// Mock Persona objects (these would likely be more complex objects or classes)
export const ArtistPersona = { name: 'Artist Persona', description: 'Manages artist-related tasks.' };
export const FanPersona = { name: 'Fan Persona', description: 'Manages fan-related tasks.' };
export const LicensorPersona = { name: 'Licensor Persona', description: 'Manages licensing tasks.' };
export const ProviderPersona = { name: 'Provider Persona', description: 'Manages content provision.' };
export const AnalyticsPersona = { name: 'Analytics Persona', description: 'Provides data insights.' };

// Mock WebSocket and crypto for browser/Node.js compatibility
// In a Node.js environment, you'd use 'ws' package for WebSocket.
// In a browser, WebSocket is global.
// crypto.randomUUID is available in Node.js v14.17.0+ and modern browsers.
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = class MockWebSocket {
    constructor(url) {
      console.log(`MockWebSocket: Created for ${url}`);
      // Simulate connection by calling onopen after a short delay
      setTimeout(() => {
        if (this.onopen) this.onopen();
      }, 100); 
    }
    send(data) { console.log('MockWebSocket: Sending', data); }
    close() { console.log('MockWebSocket: Closed'); }
  };
}
if (typeof globalThis.crypto === 'undefined' || typeof globalThis.crypto.randomUUID === 'undefined') {
  globalThis.crypto = {
    randomUUID: () => 'mock-uuid-' + Math.random().toString(36).substring(2, 15)
  };
}
globalThis.fetch = async (url, options) => {
    console.log(`MockFetch: ${options.method || 'GET'} ${url}`);
    return {
      json: async () => ({ mockData: 'success', url, options })
    };
  };
