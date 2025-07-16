interface RateLimit {
  count: number;
  resetAt: Date;
}

export class RateLimiter {
  private limits: Map<string, RateLimit>;
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.limits = new Map();
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isRateLimited(key: string): boolean {
    this.cleanup();
    
    const now = new Date();
    const limit = this.limits.get(key);

    if (!limit) {
      this.limits.set(key, {
        count: 1,
        resetAt: new Date(now.getTime() + this.windowMs)
      });
      return false;
    }

    if (now > limit.resetAt) {
      this.limits.set(key, {
        count: 1,
        resetAt: new Date(now.getTime() + this.windowMs)
      });
      return false;
    }

    if (limit.count >= this.maxRequests) {
      return true;
    }

    limit.count++;
    return false;
  }

  getRemainingRequests(key: string): number {
    const limit = this.limits.get(key);
    if (!limit || new Date() > limit.resetAt) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - limit.count);
  }

  getResetTime(key: string): Date | null {
    const limit = this.limits.get(key);
    return limit ? limit.resetAt : null;
  }

  private cleanup(): void {
    const now = new Date();
    for (const [key, limit] of this.limits.entries()) {
      if (now > limit.resetAt) {
        this.limits.delete(key);
      }
    }
  }
}
