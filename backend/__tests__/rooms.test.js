const request = require('supertest');
const express = require('express');
const roomRoutes = require('../routes/roomRoutes');
const pool = require('../config/db');
const { errorHandler } = require('../middleware/errorMiddleware');

jest.mock('../config/db');

const app = express();
app.use(express.json());
app.use('/api/rooms', roomRoutes);
app.use(errorHandler);

describe('Room Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/rooms', () => {
    it('should return 400 for invalid room price', async () => {
      const res = await request(app).post('/api/rooms').send({
        roomNumber: '101',
        price: 'not-a-number'
      });
      expect(res.statusCode).toEqual(400);
    });

    it('should create room with valid data', async () => {
      pool.query.mockResolvedValue([{ insertId: 1 }]);
      const res = await request(app).post('/api/rooms').send({
        roomNumber: '101',
        price: 100,
        type: 'Standard'
      });
      expect(res.statusCode).toEqual(201);
    });
  });
});
