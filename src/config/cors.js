/**
 * CORS Configuration
 * 
 * This module defines the CORS (Cross-Origin Resource Sharing) configuration
 * for different environments and routes in the application.
 */

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

// Get current environment
const environment = process.env.NODE_ENV || 'development';

// Ensure allowed origins for testing
allowedOrigins.test = allowedOrigins.development;

// Base CORS options
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin) {
            return callback(null, true);
        }

        // Check if origin is allowed
        if (allowedOrigins[environment].indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
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

// Strict CORS options for sensitive routes
const strictCorsOptions = {
    ...corsOptions,
    methods: ['POST'], // Only allow POST for sensitive routes
    maxAge: 300 // 5 minutes
};

// Public CORS options for open routes
const publicCorsOptions = {
    ...corsOptions,
    methods: ['GET'], // Only allow GET for public routes
    origin: '*' // Allow all origins for public routes
};

module.exports = {
    corsOptions,
    strictCorsOptions,
    publicCorsOptions,
    allowedOrigins
};
