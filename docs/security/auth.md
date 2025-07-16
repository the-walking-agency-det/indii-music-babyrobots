# Authentication & Authorization System

## Overview

The authentication and authorization system in Indii Music provides secure user authentication, role-based access control, and token management. It uses JWT (JSON Web Tokens) for stateless authentication and implements multiple security layers.

## Authentication Flow

### 1. Registration
```javascript
POST /api/auth/register
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "securePassword123",
    "username": "musiclover"
}
```

### 2. Login
```javascript
POST /api/auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "securePassword123"
}
```

### 3. Token Refresh
```javascript
POST /api/auth/refresh
Authorization: Bearer {refresh_token}
```

## Token System

### 1. Access Token
- Short-lived (15 minutes)
- Contains user ID and roles
- Used for API authentication

### 2. Refresh Token
- Long-lived (7 days)
- Stored in HTTP-only secure cookie
- Used to obtain new access tokens

## Implementation

### 1. JWT Configuration
```javascript
const jwt = require('jsonwebtoken');

const jwtConfig = {
    accessToken: {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m'
    },
    refreshToken: {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d'
    }
};
```

### 2. Token Generation
```javascript
const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user.id, roles: user.roles },
        jwtConfig.accessToken.secret,
        { expiresIn: jwtConfig.accessToken.expiresIn }
    );

    const refreshToken = jwt.sign(
        { id: user.id },
        jwtConfig.refreshToken.secret,
        { expiresIn: jwtConfig.refreshToken.expiresIn }
    );

    return { accessToken, refreshToken };
};
```

### 3. Authentication Middleware
```javascript
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, jwtConfig.accessToken.secret);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid token'
        });
    }
};
```

## Authorization System

### 1. Role-Based Access Control
```javascript
const roles = {
    USER: 'user',
    ADMIN: 'admin',
    MODERATOR: 'moderator'
};

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return res.status(403).json({
                status: 'error',
                message: 'Forbidden'
            });
        }

        const hasAllowedRole = req.user.roles
            .some(role => allowedRoles.includes(role));

        if (!hasAllowedRole) {
            return res.status(403).json({
                status: 'error',
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};
```

### 2. Permission Matrix
```javascript
const permissions = {
    tracks: {
        create: ['admin', 'moderator'],
        read: ['user', 'admin', 'moderator'],
        update: ['admin', 'moderator'],
        delete: ['admin']
    },
    playlists: {
        create: ['user', 'admin', 'moderator'],
        read: ['user', 'admin', 'moderator'],
        update: ['user', 'admin', 'moderator'],
        delete: ['user', 'admin']
    }
};
```

## Security Features

### 1. Password Handling
```javascript
const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
};

const verifyPassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};
```

### 2. Rate Limiting
- Login attempts limited
- Token refresh limited
- IP-based restrictions

### 3. Session Management
- Token blacklisting
- Concurrent session control
- Automatic session termination

## Error Handling

### 1. Authentication Errors
```javascript
{
    status: 'error',
    code: 401,
    message: 'Authentication failed',
    details: 'Invalid credentials'
}
```

### 2. Authorization Errors
```javascript
{
    status: 'error',
    code: 403,
    message: 'Authorization failed',
    details: 'Insufficient permissions'
}
```

## Testing

### 1. Authentication Tests
```javascript
describe('Authentication', () => {
    it('should register new user', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@example.com',
                password: 'password123',
                username: 'testuser'
            });
        expect(response.status).toBe(201);
    });

    it('should login user', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('accessToken');
    });
});
```

### 2. Authorization Tests
```javascript
describe('Authorization', () => {
    it('should restrict access based on roles', async () => {
        const response = await request(app)
            .delete('/api/tracks/1')
            .set('Authorization', `Bearer ${userToken}`);
        expect(response.status).toBe(403);
    });
});
```

## Best Practices

1. **Security**
   - Use secure HTTP-only cookies
   - Implement proper CORS
   - Regular security audits
   - Token rotation

2. **Performance**
   - Efficient token validation
   - Caching strategies
   - Database optimization

3. **Maintenance**
   - Regular token cleanup
   - Session monitoring
   - Access logs review

## Deployment Considerations

1. **Environment Setup**
   - Secure secret management
   - Environment-specific configurations
   - Monitoring setup

2. **Scaling**
   - Token storage strategy
   - Database replication
   - Cache distribution

## Related Documentation

- [API Security](../api/security.md)
- [CORS Configuration](cors.md)
- [Rate Limiting](rate-limiting.md)
- [Database Schema](../architecture/database-schema.md)
