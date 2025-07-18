export class APICache {
  constructor() {
    this.cache = new Map();
    this.ttls = new Map();
  }

  async get(key) {
    const now = Date.now();
    if (this.ttls.has(key) && now > this.ttls.get(key)) {
      this.cache.delete(key);
      this.ttls.delete(key);
      return null;
    }
    return this.cache.get(key) || null;
  }

  async set(key, value, ttlSeconds = 300) {
    this.cache.set(key, value);
    this.ttls.set(key, Date.now() + (ttlSeconds * 1000));
    return true;
  }

  async delete(key) {
    this.cache.delete(key);
    this.ttls.delete(key);
    return true;
  }

  async clear() {
    this.cache.clear();
    this.ttls.clear();
    return true;
  }
}
