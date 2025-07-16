const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const request = require('supertest');
const express = require('express');
const { defaultLimiter, strictLimiter, apiLimiter } = require('../../middleware/rateLimiter');

describe('Rate Limiter Middleware', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
    });

    describe('Default Limiter', () => {
        beforeEach(() => {
            app.use('/test', defaultLimiter, (req, res) => res.send('OK'));
        });

        it('should allow requests within the limit', async () => {
            // Make 5 requests (well within the 100 limit)
            for (let i = 0; i < 5; i++) {
                const response = await request(app).get('/test');
                expect(response.status).toBe(200);
            }
        });

        it('should block requests over the limit', async () => {
            // Make 101 requests (over the 100 limit)
            for (let i = 0; i < 100; i++) {
                await request(app).get('/test');
            }
            const response = await request(app).get('/test');
            expect(response.status).toBe(429);
            expect(response.text).toContain('Too many requests');
        });
    });

    describe('Strict Limiter', () => {
        beforeEach(() => {
            app.use('/auth', strictLimiter, (req, res) => res.send('OK'));
        });

        it('should allow requests within the strict limit', async () => {
            // Make 5 requests (within the 20 limit)
            for (let i = 0; i < 5; i++) {
                const response = await request(app).get('/auth');
                expect(response.status).toBe(200);
            }
        });

        it('should block requests over the strict limit', async () => {
            // Make 21 requests (over the 20 limit)
            for (let i = 0; i < 20; i++) {
                await request(app).get('/auth');
            }
            const response = await request(app).get('/auth');
            expect(response.status).toBe(429);
            expect(response.text).toContain('Too many requests');
        });
    });

    describe('API Limiter', () => {
        beforeEach(() => {
            app.use('/api', apiLimiter, (req, res) => res.send('OK'));
        });

        it('should allow requests within the API limit', async () => {
            // Make 30 requests (within the 60 per minute limit)
            for (let i = 0; i < 30; i++) {
                const response = await request(app).get('/api');
                expect(response.status).toBe(200);
            }
        });

        it('should block requests over the API limit', async () => {
            // Make 61 requests (over the 60 per minute limit)
            for (let i = 0; i < 60; i++) {
                await request(app).get('/api');
            }
            const response = await request(app).get('/api');
            expect(response.status).toBe(429);
            expect(response.text).toContain('Too many API requests');
        });
    });
});
