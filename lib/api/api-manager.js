// lib/api/api-manager.js
import { RateLimiter, APICache } from '../mocks/index.js'; // Assuming mocks are used for now, adjust if real implementations are available

export class APIManager {
  constructor(rateLimiter = new RateLimiter(), cache = new APICache()) {
    this.apis = new Map();
    this.rateLimiter = rateLimiter;
    this.cache = cache;
  }

  registerAPI(name, config) {
    this.apis.set(name, {
      baseUrl: config.baseUrl,
      auth: config.auth,
      endpoints: config.endpoints,
      rateLimit: config.rateLimit
    });
  }

  async execute(action) {
    const { api, endpoint, method, parameters } = action;
    
    // Rate limiting
    await this.rateLimiter.checkLimit(api);
    
    // Cache check
    const cacheKey = `${api}:${endpoint}:${JSON.stringify(parameters)}`;
    const cached = await this.cache.get(cacheKey);
    if (cached && method === 'GET') {
      return cached;
    }

    // Execute API call
    const apiConfig = this.apis.get(api);
    const result = await this.makeRequest(apiConfig, endpoint, method, parameters);
    
    // Cache result
    if (method === 'GET') {
      await this.cache.set(cacheKey, result, 300); // 5 min cache
    }

    return result;
  }

  async makeRequest(config, endpoint, method, parameters) {
    const url = `${config.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...config.auth
      }
    };

    if (method !== 'GET') {
      options.body = JSON.stringify(parameters);
    }

    const response = await fetch(url, options);
    return await response.json();
  }
}
