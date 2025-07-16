const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const request = require('supertest');
const express = require('express');
const { validateUser, validateTrack, validatePlaylist } = require('../../middleware/inputValidation');

describe('Input Validation Middleware', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
    });

    describe('User Validation', () => {
        beforeEach(() => {
            app.post('/register', validateUser.registration, (req, res) => res.status(200).json(req.body));
            app.post('/login', validateUser.login, (req, res) => res.status(200).json(req.body));
        });

        describe('Registration', () => {
            it('should accept valid registration data', async () => {
                const validUser = {
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'Password123!'
                };

                const response = await request(app)
                    .post('/register')
                    .send(validUser);

                expect(response.status).toBe(200);
            });

            it('should reject invalid username', async () => {
                const invalidUser = {
                    username: 'a', // too short
                    email: 'test@example.com',
                    password: 'Password123!'
                };

                const response = await request(app)
                    .post('/register')
                    .send(invalidUser);

                expect(response.status).toBe(400);
                expect(response.body.errors[0].field).toBe('username');
            });

            it('should reject invalid email', async () => {
                const invalidUser = {
                    username: 'testuser',
                    email: 'invalid-email',
                    password: 'Password123!'
                };

                const response = await request(app)
                    .post('/register')
                    .send(invalidUser);

                expect(response.status).toBe(400);
                expect(response.body.errors[0].field).toBe('email');
            });
        });

        describe('Login', () => {
            it('should accept valid login data', async () => {
                const validLogin = {
                    email: 'test@example.com',
                    password: 'Password123!'
                };

                const response = await request(app)
                    .post('/login')
                    .send(validLogin);

                expect(response.status).toBe(200);
            });

            it('should reject missing credentials', async () => {
                const invalidLogin = {
                    email: 'test@example.com'
                    // missing password
                };

                const response = await request(app)
                    .post('/login')
                    .send(invalidLogin);

                expect(response.status).toBe(400);
                expect(response.body.errors[0].field).toBe('password');
            });
        });
    });

    describe('Track Validation', () => {
        beforeEach(() => {
            app.post('/tracks', validateTrack.create, (req, res) => res.status(200).json(req.body));
            app.put('/tracks/:id', validateTrack.update, (req, res) => res.status(200).json(req.body));
        });

        it('should accept valid track creation data', async () => {
            const validTrack = {
                title: 'Test Track',
                artist: 'Test Artist',
                duration: 180,
                genre: 'Rock',
                releaseYear: 2023
            };

            const response = await request(app)
                .post('/tracks')
                .send(validTrack);

            expect(response.status).toBe(200);
        });

        it('should reject invalid track data', async () => {
            const invalidTrack = {
                title: '', // empty title
                artist: 'Test Artist',
                duration: -1, // negative duration
                genre: 'Rock',
                releaseYear: 2030 // future year
            };

            const response = await request(app)
                .post('/tracks')
                .send(invalidTrack);

            expect(response.status).toBe(400);
            expect(response.body.errors.length).toBe(3); // empty title, negative duration, future year
        });

        it('should accept valid track update data', async () => {
            const validUpdate = {
                title: 'Updated Track',
                genre: 'Jazz'
            };

            const response = await request(app)
                .put('/tracks/123')
                .send(validUpdate);

            expect(response.status).toBe(200);
        });
    });

    describe('Playlist Validation', () => {
        beforeEach(() => {
            app.post('/playlists', validatePlaylist.create, (req, res) => res.status(200).json(req.body));
            app.put('/playlists/:id', validatePlaylist.update, (req, res) => res.status(200).json(req.body));
        });

        it('should accept valid playlist creation data', async () => {
            const validPlaylist = {
                name: 'My Playlist',
                description: 'A test playlist',
                isPublic: true,
                tracks: ['507f1f77bcf86cd799439011'] // valid MongoDB ObjectId
            };

            const response = await request(app)
                .post('/playlists')
                .send(validPlaylist);

            expect(response.status).toBe(200);
        });

        it('should reject invalid playlist data', async () => {
            const invalidPlaylist = {
                name: '', // empty name
                description: 'A'.repeat(501), // too long
                tracks: ['invalid-id'] // invalid ObjectId
            };

            const response = await request(app)
                .post('/playlists')
                .send(invalidPlaylist);

            expect(response.status).toBe(400);
            expect(response.body.errors.length).toBeGreaterThan(0);
        });

        it('should accept valid playlist update with minimum fields', async () => {
            const validUpdate = {
                name: 'Updated Playlist'
            };

            const response = await request(app)
                .put('/playlists/123')
                .send(validUpdate);

            expect(response.status).toBe(200);
        });
    });
});
