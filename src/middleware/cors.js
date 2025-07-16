/**
 * CORS Middleware
 * 
 * This middleware handles Cross-Origin Resource Sharing (CORS) in the application.
 * It provides different levels of CORS protection based on route sensitivity:
 * - Strict CORS for authentication routes
 * - Public CORS for open endpoints
 * - Standard CORS for everything else
 */

const cors = require('cors');
const { corsOptions, strictCorsOptions, publicCorsOptions, allowedOrigins } = require('../config/cors');
const environment = process.env.NODE_ENV || 'development';


// Standard CORS middleware
const standardCors = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        const origin = req.get('Origin');
        if (!origin || allowedOrigins[environment].indexOf(origin) !== -1) {
            res.setHeader('Access-Control-Allow-Origin', origin || '*');
            res.setHeader('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
            res.setHeader('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Max-Age', corsOptions.maxAge.toString());
            return res.sendStatus(204);
        }
        return res.status(403).json({
            status: 'error',
            message: 'Cross-Origin Request Blocked',
            details: 'This origin is not allowed to access this resource'
        });
    }
    
    const corsHandler = cors(corsOptions);
    return corsHandler(req, res, (err) => {
        if (err) {
            if (err.message === 'Not allowed by CORS') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Cross-Origin Request Blocked',
                    details: 'This origin is not allowed to access this resource'
                });
            }
            return next(err);
        }
        next();
    });
};

// Strict CORS middleware for sensitive routes
const strictCors = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        const origin = req.get('Origin');
        if (!origin || allowedOrigins[environment].indexOf(origin) !== -1) {
            res.setHeader('Access-Control-Allow-Origin', origin || '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST');
            res.setHeader('Access-Control-Allow-Headers', strictCorsOptions.allowedHeaders.join(', '));
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Max-Age', '300');
            return res.sendStatus(204);
        }
        return res.status(403).json({
            status: 'error',
            message: 'Cross-Origin Request Blocked',
            details: 'This origin is not allowed to access this resource'
        });
    }
    
    const corsHandler = cors(strictCorsOptions);
    return corsHandler(req, res, (err) => {
        if (err) {
            if (err.message === 'Not allowed by CORS') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Cross-Origin Request Blocked',
                    details: 'This origin is not allowed to access this resource'
                });
            }
            return next(err);
        }
        next();
    });
};

// Public CORS middleware for open routes
const publicCors = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Access-Control-Allow-Headers', publicCorsOptions.allowedHeaders.join(', '));
        res.setHeader('Access-Control-Max-Age', publicCorsOptions.maxAge.toString());
        return res.sendStatus(204);
    }
    
    const corsHandler = cors(publicCorsOptions);
    return corsHandler(req, res, (err) => {
        if (err) {
            if (err.message === 'Not allowed by CORS') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Cross-Origin Request Blocked',
                    details: 'This origin is not allowed to access this resource'
                });
            }
            return next(err);
        }
        next();
    });
};

// Preflight handler
const handlePreflight = cors({
    ...corsOptions,
    preflightContinue: false,
    optionsSuccessStatus: 204
});

module.exports = {
    standardCors,
    strictCors,
    publicCors,
    handlePreflight
};
