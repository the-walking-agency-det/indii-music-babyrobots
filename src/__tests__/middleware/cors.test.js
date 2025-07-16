const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Add setImmediate polyfill
global.setImmediate = (callback) => setTimeout(callback, 0);

// Set test environment
process.env.NODE_ENV = 'test';

const request = require('supertest');
const express = require('express');
const { standardCors, strictCors, publicCors } = require('../../middleware/cors');

describe('CORS Middleware', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
    });

    describe('Standard CORS', () => {
        beforeEach(() => {
            app.use('/api/test', standardCors, (req, res) => res.json({ message: 'success' }));
        });

        it('should allow requests from allowed origins', async () => {
            const response = await request(app)
                .get('/api/test')
                .set('Origin', 'http://localhost:3000');

            expect(response.status).toBe(200);
            expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
        });

        it('should block requests from unauthorized origins', async () => {
            const response = await request(app)
                .get('/api/test')
                .set('Origin', 'http://unauthorized-domain.com');

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Cross-Origin Request Blocked');
        });

it('should allow standard HTTP methods', async () => {
            const response = await request(app)
                .options('/api/test')
                .set('Origin', 'http://localhost:3000');

            const methods = response.headers['access-control-allow-methods'].split(', ');
            expect(methods).toContain('GET');
            expect(methods).toContain('POST');
            expect(methods).toContain('PUT');
            expect(methods).toContain('DELETE');
        });
    });

    describe('Strict CORS', () => {
        beforeEach(() => {
            app.use('/api/auth', strictCors, (req, res) => res.json({ message: 'success' }));
        });

        it('should only allow POST method', async () => {
            const response = await request(app)
                .options('/api/auth')
                .set('Origin', 'http://localhost:3000');

            expect(response.headers['access-control-allow-methods']).toBe('POST');
        });

        it('should have a shorter max age', async () => {
            const response = await request(app)
                .options('/api/auth')
                .set('Origin', 'http://localhost:3000');

            expect(response.headers['access-control-max-age']).toBe('300');
        });
    });

    describe('Public CORS', () => {
        beforeEach(() => {
            app.use('/api/public', publicCors, (req, res) => res.json({ message: 'success' }));
        });

        it('should allow requests from any origin', async () => {
            const response = await request(app)
                .get('/api/public')
                .set('Origin', 'http://any-domain.com');

            expect(response.status).toBe(200);
            expect(response.headers['access-control-allow-origin']).toBe('*');
        });

        it('should only allow GET method', async () => {
            const response = await request(app)
                .options('/api/public')
                .set('Origin', 'http://any-domain.com');

            expect(response.headers['access-control-allow-methods']).toBe('GET');
        });
    });
});
