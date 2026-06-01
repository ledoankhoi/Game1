const request = require('supertest');
const { app } = require('../src/app');

describe('GET /', () => {
    it('responds with MathQuest message', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('MathQuest');
    });
});

describe('GET /api/nonexistent', () => {
    it('returns 404 for unknown routes', async () => {
        const res = await request(app).get('/api/nonexistent');
        expect(res.statusCode).toBe(404);
    });
});
