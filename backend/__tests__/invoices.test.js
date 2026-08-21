const request = require('supertest');
const express = require('express');
const invoiceRoutes = require('../routes/invoiceRoutes');
const pool = require('../config/db');
const { errorHandler } = require('../middleware/errorMiddleware');

jest.mock('../config/db');
// Mock protect middleware so we don't need tokens for unit testing
jest.mock('../middleware/authMiddleware', () => ({
  protect: (req, res, next) => next()
}));

const app = express();
app.use(express.json());
app.use('/api/invoices', invoiceRoutes);
app.use(errorHandler);

describe('Invoice Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/invoices', () => {
    it('should return 400 for invalid totalAmount', async () => {
      const res = await request(app).post('/api/invoices').send({
        bookingId: 1,
        totalAmount: 'abc'
      });
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /api/invoices/:id', () => {
    it('should return 400 for non-integer ID', async () => {
      const res = await request(app).get('/api/invoices/abc');
      expect(res.statusCode).toEqual(400);
    });
  });
});
