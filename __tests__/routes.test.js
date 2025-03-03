const request = require('supertest');
const express = require('express');

// Import your main app, or create a temporary app for the test
const app = express();
// Mock environment variable for JWT_SECRET
process.env.JWT_SECRET = 'your-test-secret';
// process.env.MONGO_URI = 'mongodb://localhost:27017/testdb';
// Mock passport module to skip authentication and session-based logic
jest.mock('passport', () => ({
    use: jest.fn(),
    authenticate: jest.fn().mockImplementation(() => (req, res, next) => next()),
    serializeUser: jest.fn(),
    deserializeUser: jest.fn(),
}));

// Mock GridFsStorage to prevent connection to MongoDB during tests
jest.mock('multer-gridfs-storage', () => {
    return {
      GridFsStorage: jest.fn().mockImplementation(() => ({
        _handleFile: jest.fn((req, file, callback) => callback(null, { filename: file.originalname })),
        _removeFile: jest.fn((req, file, callback) => callback(null)),
      })),
    };
  });
// Mount your main router
const router = require('../routes'); // Adjust path if necessary
app.use('/', router);  // This will mount your routes on the root for testing

describe('Route Tests', () => {

    test('GET /auth should respond with 200', async () => {
        const response = await request(app).get('/auth');
        expect(response.statusCode).toBe(200);  // Adjust if auth needs a token, etc.
    });

    test('GET /device-history should respond with 200', async () => {
        const response = await request(app).get('/device-history');
        expect(response.statusCode).toBe(200);
    });

    // test('GET /users should respond with 200', async () => {
    //     const response = await request(app).get('/users');
    //     expect(response.statusCode).toBe(200);
    // });

    test('GET /teams should respond with 200', async () => {
        const response = await request(app).get('/teams');
        expect(response.statusCode).toBe(200);
    });

    test('GET /players should respond with 200', async () => {
        const response = await request(app).get('/players');
        expect(response.statusCode).toBe(200);
    });

    // test('GET /quizz should respond with 200', async () => {
    //     const response = await request(app).get('/quizz');
    //     expect(response.statusCode).toBe(200);
    // });

    // test('GET /match should respond with 200', async () => {
    //     const response = await request(app).get('/match');
    //     expect(response.statusCode).toBe(200);
    // });

});
