import { APICache } from '../lib/mocks/index.js';
import { MemoryMapper } from '../lib/memory/memory-mapper.js';
import { VectorStore } from '../lib/mocks/index.js';
import fs from 'fs/promises';
import path from 'path';

describe('Cache Eviction Policies', () => {
  const testCacheDir = path.join(process.cwd(), '.test_cache_dir');
  const apiCache = new APICache();
  const memoryMapper = new MemoryMapper('testAgent', new VectorStore());

  beforeAll(async () => {
    // Ensure test cache directories are clean
    await fs.rm(apiCache.cacheDir, { recursive: true, force: true });
    await fs.rm(memoryMapper.cacheDir, { recursive: true, force: true });
    await apiCache.initCacheDir();
    await memoryMapper.initCacheDir();
  });

  afterAll(async () => {
    // Clean up test cache directories
    await fs.rm(apiCache.cacheDir, { recursive: true, force: true });
    await fs.rm(memoryMapper.cacheDir, { recursive: true, force: true });
  });

  test('APICache should evict items after TTL expires', async () => {
    const key = 'api_test_key';
    const value = { data: 'api_test_value' };
    const ttl = 1; // 1 second

    await apiCache.set(key, value, ttl);
    let retrieved = await apiCache.get(key);
    expect(retrieved).toEqual(value); // Should be in cache

    await new Promise(resolve => setTimeout(resolve, ttl * 1000 + 100)); // Wait for TTL to expire

    retrieved = await apiCache.get(key);
    expect(retrieved).toBeNull(); // Should be evicted
  });

  test('MemoryMapper cache should evict items after TTL expires', async () => {
    const query = 'memory_test_query';
    const currentContext = { some: 'context' };
    const persona = { name: 'testPersona' };
    const capabilities = ['cap1'];
    const ttl = 1; // 1 second

    // Manually set the cache entry with a TTL
    const cacheKey = JSON.stringify({ query, agentType: memoryMapper.agentType });
    const mappedContext = memoryMapper.buildContext([], currentContext, persona, capabilities);
    const filePath = path.join(memoryMapper.cacheDir, `${cacheKey}.json`);
    const expiry = Date.now() + ttl * 1000;
    await fs.writeFile(filePath, JSON.stringify({ value: mappedContext, expiry }), 'utf8');
    memoryMapper.contextCache.set(cacheKey, mappedContext); // Also set in-memory

    // Verify it's in cache initially
    let retrieved = await memoryMapper.mapMemory(query, currentContext, persona, capabilities);
    expect(retrieved).toEqual(mappedContext);

    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, ttl * 1000 + 100));

    // Call mapMemory again, which should trigger eviction and re-fetch
    retrieved = await memoryMapper.mapMemory(query, currentContext, persona, capabilities);

    // Expect the retrieved value to be from a new search (mocked VectorStore result)
    const expectedNewContext = memoryMapper.buildContext([{ id: 'mem1', content: 'Relevant memory 1' }], currentContext, persona, capabilities);
    expect(retrieved).toEqual(expectedNewContext);
  });
});
