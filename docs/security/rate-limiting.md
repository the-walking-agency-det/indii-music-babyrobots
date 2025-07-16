# Rate Limiting Implementation

## Overview

Rate limiting in Indii Music implements a multi-tier strategy to protect against abuse while ensuring legitimate users maintain good service levels. The implementation uses a token bucket algorithm with different rate limits based on route sensitivity and user authentication status.

## Rate Limiting Tiers

### 1. Default Rate Limits
```javascript
const defaultLimits = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.'
};
```

### 2. Strict Rate Limits (Auth Routes)
```javascript
const strictLimits = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later.'
};
```

### 3. API Rate Limits
```javascript
const apiLimits = {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'API rate limit exceeded, please try again later.'
};
```

## Implementation Details

### Middleware Configuration

```javascript
const rateLimit = require('express-rate-limit');

// Default limiter
const defaultLimiter = rateLimit(defaultLimits);

// Strict limiter for auth routes
const strictLimiter = rateLimit(strictLimits);

// API limiter
const apiLimiter = rateLimit(apiLimits);
```

### Route Application

```javascript
// Apply to all routes
app.use(defaultLimiter);

// Apply to auth routes
app.use('/api/auth', strictLimiter);

// Apply to API routes
app.use('/api', apiLimiter);
```

## Headers and Response

### Rate Limit Headers
- `X-RateLimit-Limit`: Maximum requests allowed in the window
- `X-RateLimit-Remaining`: Remaining requests in the current window
- `X-RateLimit-Reset`: Time when the rate limit resets

### Error Response
```javascript
{
    status: 'error',
    code: 429,
    message: 'Too many requests, please try again later.',
    retryAfter: 900 // seconds until reset
}
```

## Advanced Features

### 1. Dynamic Rate Limiting
- Adjusted limits based on user authentication status
- IP-based vs. token-based limiting
- Custom rules for specific endpoints

### 2. Store Configuration
```javascript
const store = {
    type: 'redis',
    client: redisClient,
    prefix: 'rl:', // Redis key prefix
    resetExpiryOnChange: true
};
```

### 3. Custom Key Generation
```javascript
const keyGenerator = (req) => {
    if (req.user) {
        return `user:${req.user.id}`;
    }
    return req.ip;
};
```

## Security Considerations

1. **DDoS Protection**
   - Multiple limiting tiers
   - IP-based rate limiting
   - Automatic blocking of excessive requests

2. **Brute Force Prevention**
   - Strict limits on authentication routes
   - Progressive delays
   - Account lockout policies

3. **API Abuse Prevention**
   - Route-specific limits
   - User-based quotas
   - Monitoring and alerting

## Monitoring and Logging

### 1. Rate Limit Events
```javascript
const rateLimitHandler = (req, res, next) => {
    if (req.rateLimit.remaining === 0) {
        logger.warn('Rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            limit: req.rateLimit.limit,
            windowMs: req.rateLimit.windowMs
        });
    }
    next();
};
```

### 2. Metrics Collection
- Request counts per IP
- Rate limit hits
- Response times
- Error rates

## Testing

### 1. Rate Limit Tests
```javascript
describe('Rate Limiting', () => {
    it('should limit requests within window', async () => {
        // Make requests up to limit
        for (let i = 0; i < limit; i++) {
            await request(app).get('/api/test');
        }
        // Next request should fail
        const response = await request(app).get('/api/test');
        expect(response.status).toBe(429);
    });
});
```

### 2. Test Scenarios
- Basic rate limiting
- Authentication route limits
- API route limits
- Header validation
- Reset timing
- Store functionality

## Best Practices

1. **Configuration**
   - Use environment variables for limits
   - Implement graceful degradation
   - Set appropriate window sizes
   - Configure proper error messages

2. **Performance**
   - Use efficient storage (Redis)
   - Optimize key generation
   - Minimize response time impact
   - Handle storage failures

3. **Maintenance**
   - Regular monitoring
   - Alert thresholds
   - Documentation updates
   - Performance tuning

## Deployment Considerations

1. **Environment Setup**
   - Configure different limits per environment
   - Set up monitoring
   - Configure storage backend
   - Test failure scenarios

2. **Scaling**
   - Distributed rate limiting
   - Load balancer configuration
   - Cache synchronization
   - Failover handling

## Error Handling

### 1. Rate Limit Exceeded
```javascript
{
    status: 'error',
    code: 429,
    message: 'Rate limit exceeded',
    details: {
        limit: 100,
        remaining: 0,
        resetTime: '2025-07-16T19:00:00Z'
    }
}
```

### 2. Storage Errors
```javascript
{
    status: 'error',
    code: 500,
    message: 'Rate limiting temporarily unavailable',
    retryAfter: 60
}
```

## Related Documentation

- [Security Overview](../security/README.md)
- [API Error Handling](../api/error-handling.md)
- [Monitoring Setup](../deployment/monitoring.md)
- [Redis Configuration](../deployment/redis.md)
