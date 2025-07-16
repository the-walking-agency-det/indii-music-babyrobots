# CORS Security Implementation

## Overview

The CORS (Cross-Origin Resource Sharing) implementation in Indii Music follows a multi-tiered approach to provide appropriate levels of security for different types of routes while maintaining necessary functionality.

## Implementation Strategy

### Three-Tier CORS Model

1. **Standard CORS** (`standardCors`)
   - Used for general API routes
   - Allows multiple HTTP methods
   - Environment-specific origin validation
   - 24-hour preflight caching

2. **Strict CORS** (`strictCors`)
   - Used for sensitive routes (authentication, user data)
   - POST-only method restriction
   - Shorter preflight cache (5 minutes)
   - Strict origin validation

3. **Public CORS** (`publicCors`)
   - Used for public endpoints
   - GET-only method restriction
   - Allows all origins
   - Standard preflight caching

## Configuration

### Allowed Origins

```javascript
const allowedOrigins = {
    development: [
        'http://localhost:3000',
        'http://localhost:9000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:9000'
    ],
    staging: [
        'https://staging.indii-music.com',
        'https://staging-api.indii-music.com'
    ],
    production: [
        'https://indii-music.com',
        'https://api.indii-music.com'
    ]
};
```

### CORS Options

```javascript
const corsOptions = {
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 86400 // 24 hours
};
```

## Route-Specific Implementation

### Standard Routes
```javascript
app.use('/api/tracks', standardCors, tracksRouter);
app.use('/api/playlists', standardCors, playlistsRouter);
```

### Sensitive Routes
```javascript
app.use('/api/auth', strictCors, authRouter);
app.use('/api/user', strictCors, userRouter);
```

### Public Routes
```javascript
app.use('/api/public', publicCors, publicRouter);
```

## Error Handling

CORS violations are handled with specific error responses:

```javascript
{
    status: 'error',
    message: 'Cross-Origin Request Blocked',
    details: 'This origin is not allowed to access this resource'
}
```

## Security Considerations

1. **Origin Validation**
   - Whitelist-based approach
   - Environment-specific configurations
   - No wildcard origins for sensitive routes

2. **Method Restrictions**
   - Strict method control per route type
   - Preflight request handling
   - OPTIONS request validation

3. **Credentials Handling**
   - Secure cookie transmission
   - Proper Access-Control-Allow-Credentials
   - Origin-specific Access-Control-Allow-Origin

4. **Header Controls**
   - Explicit allowed headers list
   - Exposed headers for pagination
   - Environment-specific configurations

## Testing

The CORS implementation includes comprehensive tests:

1. **Standard CORS Tests**
   - Origin validation
   - Method allowance
   - Header presence
   - Preflight handling

2. **Strict CORS Tests**
   - POST-only validation
   - Short cache duration
   - Origin restrictions

3. **Public CORS Tests**
   - GET-only validation
   - All-origin acceptance
   - Header consistency

## Best Practices

1. **Security**
   - Never use `Access-Control-Allow-Origin: *` for authenticated routes
   - Validate origins against whitelist
   - Use HTTPS in production
   - Implement rate limiting alongside CORS

2. **Performance**
   - Appropriate cache durations
   - Efficient origin checking
   - Minimal preflight requests

3. **Maintenance**
   - Environment-specific configurations
   - Easy origin list updates
   - Clear error messages

## Deployment Considerations

1. **Environment Setup**
   - Configure allowed origins per environment
   - Use environment variables
   - Validate CORS in staging

2. **Monitoring**
   - Log CORS violations
   - Track preflight requests
   - Monitor cache effectiveness

## Related Documentation

- [Security Headers Configuration](security-headers.md)
- [Rate Limiting Implementation](rate-limiting.md)
- [Authentication System](auth.md)
- [API Overview](../api/overview.md)
