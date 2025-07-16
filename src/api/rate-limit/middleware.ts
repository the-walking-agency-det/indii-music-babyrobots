import { ApiRequest, ApiResponse, RequestMiddleware, RouteHandler } from '../types';
import { RateLimiter } from './limiter';

export function createRateLimitMiddleware(
  limiter: RateLimiter,
  keyGenerator: (req: ApiRequest) => string = defaultKeyGenerator
): RequestMiddleware {
  return async (request: ApiRequest, next: RouteHandler): Promise<ApiResponse> => {
    const key = keyGenerator(request);
    
    if (limiter.isRateLimited(key)) {
      return {
        status: 429,
        body: { 
          error: 'Too Many Requests',
          resetAt: limiter.getResetTime(key)
        },
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': limiter.getResetTime(key)?.toISOString() || '',
        }
      };
    }

    const response = await next(request);
    const remaining = limiter.getRemainingRequests(key);
    
    return {
      ...response,
      headers: {
        ...response.headers,
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': limiter.getResetTime(key)?.toISOString() || '',
      }
    };
  };
}

function defaultKeyGenerator(request: ApiRequest): string {
  // Default to using IP or user ID as rate limit key
  const userId = request.headers['X-User-ID'];
  const ip = request.headers['X-Forwarded-For'] || request.headers['X-Real-IP'];
  return userId || ip || 'anonymous';
}
