# Error Handling Guide

## Overview

This guide details the error handling patterns used in the Indii Music API. Our error handling system is designed to be consistent, informative, and secure, providing clear feedback while maintaining security.

## Error Response Format

### Standard Error Response
```json
{
    "status": "error",
    "code": 400,
    "message": "Error message here",
    "details": {
        "field": "Additional error details"
    }
}
```

### Validation Error Response
```json
{
    "status": "error",
    "code": 400,
    "message": "Validation failed",
    "details": [
        {
            "field": "username",
            "message": "Username must be at least 3 characters"
        },
        {
            "field": "email",
            "message": "Email is required"
        }
    ]
}
```

## HTTP Status Codes

### Client Errors (4xx)

#### 400 Bad Request
- Invalid request body
- Validation errors
- Malformed requests

```json
{
    "status": "error",
    "code": 400,
    "message": "Bad Request",
    "details": "Request body is missing required field: title"
}
```

#### 401 Unauthorized
- Missing authentication
- Invalid credentials
- Expired tokens

```json
{
    "status": "error",
    "code": 401,
    "message": "Unauthorized",
    "details": "Access token has expired"
}
```

#### 403 Forbidden
- Insufficient permissions
- Role-based access denied
- Resource ownership violation

```json
{
    "status": "error",
    "code": 403,
    "message": "Forbidden",
    "details": "Insufficient permissions to delete this track"
}
```

#### 404 Not Found
- Resource not found
- Invalid endpoints
- Deleted resources

```json
{
    "status": "error",
    "code": 404,
    "message": "Not Found",
    "details": {
        "resource": "track",
        "id": "12345"
    }
}
```

#### 429 Too Many Requests
- Rate limit exceeded
- API quota exceeded

```json
{
    "status": "error",
    "code": 429,
    "message": "Too Many Requests",
    "details": {
        "retryAfter": 60,
        "limit": 100,
        "remaining": 0
    }
}
```

### Server Errors (5xx)

#### 500 Internal Server Error
- Unexpected server errors
- Database failures
- System errors

```json
{
    "status": "error",
    "code": 500,
    "message": "Internal Server Error",
    "details": "An unexpected error occurred"
}
```

#### 503 Service Unavailable
- System maintenance
- Server overload
- Temporary outages

```json
{
    "status": "error",
    "code": 503,
    "message": "Service Unavailable",
    "details": {
        "retryAfter": 3600,
        "maintenance": true
    }
}
```

## Error Handling Implementation

### 1. Global Error Handler
```javascript
app.use((err, req, res, next) => {
    // Log error details
    logger.error('Error:', {
        error: err,
        method: req.method,
        path: req.path,
        body: req.body,
        user: req.user?.id
    });

    // Default error response
    const response = {
        status: 'error',
        code: err.status || 500,
        message: err.message || 'Internal Server Error',
        details: err.details || null
    };

    // Remove stack trace in production
    if (process.env.NODE_ENV === 'development' && err.stack) {
        response.stack = err.stack;
    }

    res.status(response.code).json(response);
});
```

### 2. Custom Error Classes
```javascript
class APIError extends Error {
    constructor(message, status, details = null) {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends APIError {
    constructor(details) {
        super('Validation failed', 400, details);
        this.name = 'ValidationError';
    }
}

class NotFoundError extends APIError {
    constructor(resource, id) {
        super('Not Found', 404, { resource, id });
        this.name = 'NotFoundError';
    }
}
```

### 3. Error Handling Middleware
```javascript
const handleAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            throw new ValidationError(error.details);
        }
        next();
    };
};
```

## Client-Side Error Handling

### 1. Error Interceptor
```javascript
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            // API error response
            const { status, data } = error.response;
            
            switch (status) {
                case 401:
                    // Handle authentication errors
                    return handleAuthError(error);
                case 403:
                    // Handle authorization errors
                    return handleForbiddenError(error);
                case 429:
                    // Handle rate limiting
                    return handleRateLimitError(error);
                default:
                    // Handle other errors
                    return Promise.reject(error);
            }
        }
        
        // Network error
        return Promise.reject(error);
    }
);
```

### 2. Error Utilities
```javascript
const errorHandlers = {
    async handleAuthError(error) {
        if (error.response.status === 401) {
            try {
                await authManager.refreshToken();
                // Retry original request
                return axios(error.config);
            } catch (refreshError) {
                // Handle refresh token failure
                authManager.logout();
                throw new Error('Session expired');
            }
        }
        throw error;
    },

    handleAPIError(error) {
        if (error.response?.data) {
            return {
                message: error.response.data.message,
                details: error.response.data.details
            };
        }
        return {
            message: 'An unexpected error occurred',
            details: null
        };
    }
};
```

## Best Practices

### 1. Error Logging
```javascript
const logger = {
    error(message, error) {
        console.error({
            timestamp: new Date().toISOString(),
            message,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
                details: error.details
            }
        });
    }
};
```

### 2. Security Considerations
- Never expose internal error details
- Sanitize error messages
- Log sensitive information securely
- Use appropriate status codes

### 3. Response Structure
- Consistent error format
- Clear error messages
- Appropriate error codes
- Helpful error details

## Related Documentation

- [API Overview](overview.md)
- [Authentication Guide](auth-guide.md)
- [Validation Guide](validation-guide.md)
- [Logging Strategy](../deployment/logging.md)
