const express = require('express');
const { defaultLimiter, strictLimiter, apiLimiter } = require('./middleware/rateLimiter');
const securityHeaders = require('./middleware/securityHeaders');
const { standardCors, strictCors, publicCors, handlePreflight } = require('./middleware/cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

// Handle CORS preflight requests
app.options('*', handlePreflight);

// Apply appropriate CORS policies based on route sensitivity
app.use('/api/auth', strictCors);
app.use('/api/users', strictCors);
app.use('/api/public', publicCors);
app.use('/api', standardCors);

// Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Apply security headers to all routes
app.use(securityHeaders);

// Apply default rate limiting to all routes
app.use(defaultLimiter);

// Apply strict rate limiting to auth routes
app.use('/api/auth/*', strictLimiter);
app.use('/api/users/*', strictLimiter);

// Apply API rate limiting to other API routes
app.use('/api/*', apiLimiter);

// ... rest of your route configurations ...

module.exports = app;
