const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/authRoutes');
const pool = require('../config/db');
const { errorHandler } = require('../middleware/errorMiddleware');

jest.mock('../config/db');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 for missing credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      pool.query.mockResolvedValue([[]]); // No user found
      const res = await request(app).post('/api/auth/login').send({ email: 'test@test.com', password: 'password' });
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual('Invalid email or password');
    });
  });
});
