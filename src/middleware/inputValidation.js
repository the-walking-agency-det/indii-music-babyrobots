const Joi = require('joi');

// User validation schemas
const userSchemas = {
    registration: Joi.object({
        username: Joi.string()
            .alphanum()
            .min(3)
            .max(30)
            .required(),
        email: Joi.string()
            .email()
            .required(),
        password: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9!@#$%^&*]{8,30}$'))
            .required()
            .messages({
                'string.pattern.base': 'Password must be 8-30 characters and contain only letters, numbers, and special characters (!@#$%^&*)'
            })
    }),
    login: Joi.object({
        email: Joi.string()
            .email()
            .required(),
        password: Joi.string()
            .required()
    })
};

// Music track validation schemas
const trackSchemas = {
    create: Joi.object({
        title: Joi.string()
            .min(1)
            .max(200)
            .required(),
        artist: Joi.string()
            .min(1)
            .max(200)
            .required(),
        duration: Joi.number()
            .integer()
            .min(1)
            .required(),
        genre: Joi.string()
            .min(1)
            .max(50)
            .required(),
        releaseYear: Joi.number()
            .integer()
            .min(1900)
            .max(new Date().getFullYear())
    }),
    update: Joi.object({
        title: Joi.string()
            .min(1)
            .max(200),
        artist: Joi.string()
            .min(1)
            .max(200),
        duration: Joi.number()
            .integer()
            .min(1),
        genre: Joi.string()
            .min(1)
            .max(50),
        releaseYear: Joi.number()
            .integer()
            .min(1900)
            .max(new Date().getFullYear())
    }).min(1) // At least one field must be provided for update
};

// Playlist validation schemas
const playlistSchemas = {
    create: Joi.object({
        name: Joi.string()
            .min(1)
            .max(100)
            .required(),
        description: Joi.string()
            .max(500)
            .allow('', null),
        isPublic: Joi.boolean()
            .default(false),
        tracks: Joi.array()
            .items(Joi.string().hex().length(24)) // MongoDB ObjectId format
            .default([])
    }),
    update: Joi.object({
        name: Joi.string()
            .min(1)
            .max(100),
        description: Joi.string()
            .max(500)
            .allow('', null),
        isPublic: Joi.boolean(),
        tracks: Joi.array()
            .items(Joi.string().hex().length(24))
    }).min(1)
};

// Generic validation middleware factory
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true // Remove unknown fields
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            
            return res.status(400).json({
                status: 'error',
                message: 'Invalid input data',
                errors
            });
        }

        next();
    };
};

// Specific validation middlewares
const validateUser = {
    registration: validateRequest(userSchemas.registration),
    login: validateRequest(userSchemas.login)
};

const validateTrack = {
    create: validateRequest(trackSchemas.create),
    update: validateRequest(trackSchemas.update)
};

const validatePlaylist = {
    create: validateRequest(playlistSchemas.create),
    update: validateRequest(playlistSchemas.update)
};

module.exports = {
    validateUser,
    validateTrack,
    validatePlaylist
};
