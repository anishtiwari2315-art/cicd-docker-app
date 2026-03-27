const request = require('supertest');
const app = require('../src/app');

describe('CI/CD Docker App - API Tests', () => {

  // ---- Health Check ----
  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('uptime');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  // ---- Root Route ----
  describe('GET /', () => {
    it('should return welcome message', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('CI/CD');
    });
  });

  // ---- Items API ----
  describe('GET /api/items', () => {
    it('should return an array of items', async () => {
      const res = await request(app).get('/api/items');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item', async () => {
      const newItem = { name: 'Test Item', description: 'Test Description' };
      const res = await request(app)
        .post('/api/items')
        .send(newItem)
        .set('Content-Type', 'application/json');
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(newItem.name);
    });

    it('should return 400 if name is missing', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({ description: 'No name item' })
        .set('Content-Type', 'application/json');
      expect(res.statusCode).toBe(400);
    });
  });

  // ---- Metrics ----
  describe('GET /metrics', () => {
    it('should return prometheus metrics', async () => {
      const res = await request(app).get('/metrics');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('http_requests_total');
    });
  });

  // ---- 404 Handler ----
  describe('Unknown routes', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/unknown-route-xyz');
      expect(res.statusCode).toBe(404);
    });
  });

});
