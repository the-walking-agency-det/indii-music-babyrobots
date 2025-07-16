const rateLimit = require('express-rate-limit');

// Default rate limiter - 100 requests per 15 minutes
const defaultLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict limiter for sensitive routes (auth, user data) - 20 requests per 15 minutes
const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per windowMs
    message: 'Too many requests for sensitive operations, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

// API limiter - 60 requests per minute
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // Limit each IP to 60 requests per windowMs
    message: 'Too many API requests from this IP, please try again after a minute',
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    defaultLimiter,
    strictLimiter,
    apiLimiter
};
