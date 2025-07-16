# Authentication Guide

## Overview

This guide details the authentication process for the Indii Music API. The API uses JWT (JSON Web Tokens) for authentication, implementing a secure token-based system with refresh token rotation.

## Authentication Flow

### 1. Registration

#### Request
```http
POST /api/auth/register
Content-Type: application/json

{
    "username": "musiclover",
    "email": "user@example.com",
    "password": "securePassword123"
}
```

#### Response
```json
{
    "status": "success",
    "data": {
        "user": {
            "id": "12345",
            "username": "musiclover",
            "email": "user@example.com",
            "createdAt": "2025-07-16T19:00:00Z"
        }
    }
}
```

### 2. Login

#### Request
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "securePassword123"
}
```

#### Response
```json
{
    "status": "success",
    "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIs...",
        "user": {
            "id": "12345",
            "username": "musiclover",
            "email": "user@example.com"
        }
    }
}
```

### 3. Token Refresh

#### Request
```http
POST /api/auth/refresh
Cookie: refreshToken=eyJhbGciOiJIUzI1NiIs...
```

#### Response
```json
{
    "status": "success",
    "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIs..."
    }
}
```

### 4. Logout

#### Request
```http
POST /api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Response
```json
{
    "status": "success",
    "message": "Successfully logged out"
}
```

## Token Usage

### 1. Access Token

- Include in Authorization header
- Format: `Bearer <token>`
- Example:
```http
GET /api/tracks
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### 2. Refresh Token

- Stored in HTTP-only secure cookie
- Automatically included in refresh requests
- Used to obtain new access tokens

## Error Handling 

### 1. Invalid Credentials
```json
{
    "status": "error",
    "code": 401,
    "message": "Invalid credentials",
    "details": "Email or password is incorrect"
}
```

### 2. Token Expired
```json
{
    "status": "error",
    "code": 401,
    "message": "Token expired",
    "details": "Access token has expired"
}
```

### 3. Invalid Token
```json
{
    "status": "error",
    "code": 401,
    "message": "Invalid token",
    "details": "Token signature is invalid"
}
```

## Security Considerations

### 1. Token Storage
- Access token: Memory storage only
- Refresh token: HTTP-only secure cookie
- Never store in localStorage/sessionStorage

### 2. Token Expiration
- Access token: 15 minutes
- Refresh token: 7 days
- Regular rotation for security

### 3. CORS Settings
```http
Access-Control-Allow-Credentials: true
Access-Control-Allow-Headers: Authorization
Access-Control-Allow-Methods: POST, GET, OPTIONS
```

## Best Practices

### 1. Token Management
```javascript
// Client-side token management
class AuthManager {
    setAccessToken(token) {
        this.accessToken = token; // Memory only
    }

    getAuthHeader() {
        return {
            Authorization: `Bearer ${this.accessToken}`
        };
    }

    async refreshToken() {
        const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include' // Important for cookies
        });
        const data = await response.json();
        this.setAccessToken(data.accessToken);
    }
}
```

### 2. Request Interceptor
```javascript
// Axios interceptor example
axios.interceptors.response.use(
    response => response,
    async error => {
        if (error.response.status === 401) {
            // Token expired
            await authManager.refreshToken();
            // Retry original request
            return axios(error.config);
        }
        return Promise.reject(error);
    }
);
```

### 3. Secure Headers
```javascript
// Server-side security headers
app.use((req, res, next) => {
    res.set({
        'Strict-Transport-Security': 'max-age=31536000',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
    });
    next();
});
```

## Example Implementations

### 1. Login Implementation
```javascript
async function login(email, password) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        const data = await response.json();
        if (data.status === 'success') {
            authManager.setAccessToken(data.data.accessToken);
            return data.data.user;
        }
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}
```

### 2. Protected Request
```javascript
async function getProtectedResource() {
    try {
        const response = await fetch('/api/protected', {
            headers: {
                ...authManager.getAuthHeader()
            },
            credentials: 'include'
        });

        if (response.status === 401) {
            await authManager.refreshToken();
            // Retry request
            return getProtectedResource();
        }

        return response.json();
    } catch (error) {
        console.error('Request failed:', error);
        throw error;
    }
}
```

## Related Documentation

- [API Overview](overview.md)
- [Error Handling Guide](error-handling.md)
- [Security Implementation](../security/auth.md)
- [CORS Configuration](../security/cors.md)
