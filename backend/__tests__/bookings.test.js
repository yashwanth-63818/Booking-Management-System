const request = require('supertest');
const express = require('express');
const bookingRoutes = require('../routes/bookingRoutes');
const pool = require('../config/db');
const { errorHandler } = require('../middleware/errorMiddleware');

jest.mock('../config/db');

const app = express();
app.use(express.json());
app.use('/api/bookings', bookingRoutes);
app.use(errorHandler);

describe('Booking Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/bookings', () => {
    it('should return 400 for missing customerName', async () => {
      const res = await request(app).post('/api/bookings').send({
        room: '101', checkIn: '2023-01-01', checkOut: '2023-01-05'
      });
      expect(res.statusCode).toEqual(400);
    });

    it('should create booking with valid data', async () => {
      // Mock overlap check
      pool.query.mockResolvedValueOnce([[]]);
      // Mock insert
      pool.query.mockResolvedValueOnce([{ insertId: 1 }]);
      // Mock update room
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app).post('/api/bookings').send({
        customerName: 'John Doe',
        phone: '1234567890',
        room: '101',
        checkIn: '2023-01-01',
        checkOut: '2023-01-05'
      });
      expect(res.statusCode).toEqual(201);
    });
  });
});
