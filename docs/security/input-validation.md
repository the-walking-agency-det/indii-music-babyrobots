# Input Validation System

## Overview

Input validation in Indii Music ensures data integrity and security by validating all incoming requests against predefined schemas. We use Joi for schema validation and implement multiple validation layers throughout the application.

## Validation Schemas

### 1. User Schema
```javascript
const Joi = require('joi');

const userSchema = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    email: Joi.string()
        .email()
        .required(),
    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{8,30}$'))
        .required(),
    role: Joi.string()
        .valid('user', 'admin', 'moderator')
        .default('user')
});
```

### 2. Track Schema
```javascript
const trackSchema = Joi.object({
    title: Joi.string()
        .min(1)
        .max(100)
        .required(),
    artist: Joi.string()
        .min(1)
        .max(100)
        .required(),
    album: Joi.string()
        .min(1)
        .max(100),
    duration: Joi.number()
        .integer()
        .min(0)
        .required(),
    genre: Joi.string()
        .min(1)
        .max(50),
    releaseYear: Joi.number()
        .integer()
        .min(1900)
        .max(new Date().getFullYear())
});
```

### 3. Playlist Schema
```javascript
const playlistSchema = Joi.object({
    name: Joi.string()
        .min(1)
        .max(100)
        .required(),
    description: Joi.string()
        .max(500),
    isPublic: Joi.boolean()
        .default(false),
    tracks: Joi.array()
        .items(Joi.string().hex().length(24))
        .default([])
});
```

## Validation Middleware

### 1. Request Body Validation
```javascript
const validateBody = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                details: error.details.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }

        next();
    };
};
```

### 2. Query Parameters Validation
```javascript
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid query parameters',
                details: error.details.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }

        next();
    };
};
```

### 3. URL Parameters Validation
```javascript
const validateParams = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid URL parameters',
                details: error.details.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }

        next();
    };
};
```

## Implementation Examples

### 1. Route Implementation
```javascript
const express = require('express');
const router = express.Router();

router.post('/tracks',
    validateBody(trackSchema),
    async (req, res) => {
        // Handle track creation
    }
);

router.get('/tracks',
    validateQuery(trackQuerySchema),
    async (req, res) => {
        // Handle track listing
    }
);

router.get('/tracks/:id',
    validateParams(trackParamsSchema),
    async (req, res) => {
        // Handle single track retrieval
    }
);
```

### 2. Custom Validators
```javascript
const customValidators = {
    isValidMusicFormat: (value, helpers) => {
        const allowedFormats = ['mp3', 'wav', 'ogg'];
        const format = value.split('.').pop().toLowerCase();
        
        if (!allowedFormats.includes(format)) {
            return helpers.error('any.invalid');
        }
        
        return value;
    }
};

const uploadSchema = Joi.object({
    file: Joi.string()
        .custom(customValidators.isValidMusicFormat)
        .required()
});
```

## Error Handling

### 1. Validation Errors
```javascript
{
    status: 'error',
    message: 'Validation failed',
    details: [
        {
            field: 'username',
            message: 'Username must be between 3 and 30 characters'
        },
        {
            field: 'email',
            message: 'Email must be a valid email address'
        }
    ]
}
```

### 2. Custom Error Messages
```javascript
const schema = Joi.object({
    username: Joi.string()
        .min(3)
        .max(30)
        .required()
        .messages({
            'string.min': 'Username must be at least {#limit} characters',
            'string.max': 'Username cannot exceed {#limit} characters',
            'any.required': 'Username is required'
        })
});
```

## Testing

### 1. Schema Validation Tests
```javascript
describe('User Schema Validation', () => {
    it('should validate correct user data', () => {
        const data = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        };
        const { error } = userSchema.validate(data);
        expect(error).toBeUndefined();
    });

    it('should reject invalid email', () => {
        const data = {
            username: 'testuser',
            email: 'invalid-email',
            password: 'password123'
        };
        const { error } = userSchema.validate(data);
        expect(error).toBeDefined();
    });
});
```

### 2. Middleware Tests
```javascript
describe('Validation Middleware', () => {
    it('should reject invalid request body', async () => {
        const response = await request(app)
            .post('/api/tracks')
            .send({
                // Missing required fields
            });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('details');
    });
});
```

## Best Practices

1. **Schema Design**
   - Clear field requirements
   - Appropriate data types
   - Reasonable limits
   - Custom error messages

2. **Security**
   - Input sanitization
   - XSS prevention
   - SQL injection prevention
   - NoSQL injection prevention

3. **Performance**
   - Efficient validation
   - Caching schemas
   - Early validation

## Deployment Considerations

1. **Configuration**
   - Environment-specific validation
   - Schema versioning
   - Error message localization

2. **Monitoring**
   - Validation failure tracking
   - Performance monitoring
   - Error rate alerts

## Related Documentation

- [API Security](../api/security.md)
- [Error Handling](../api/error-handling.md)
- [Database Schema](../architecture/database-schema.md)
- [Testing Strategy](../testing/validation.md)
