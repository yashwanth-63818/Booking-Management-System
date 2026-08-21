const request = require('supertest');
const express = require('express');
const guestRoutes = require('../routes/guestRoutes');
const pool = require('../config/db');
const { errorHandler } = require('../middleware/errorMiddleware');

jest.mock('../config/db');

const app = express();
app.use(express.json());
app.use('/api/guests', guestRoutes);
app.use(errorHandler);

describe('Guest Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/guests', () => {
    it('should return list of guests', async () => {
      pool.query.mockResolvedValue([[{ id: 1, name: 'John Doe' }]]);
      const res = await request(app).get('/api/guests');
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
    });
  });

  describe('PUT /api/guests/:id', () => {
    it('should return 400 for invalid ID', async () => {
      const res = await request(app).put('/api/guests/not-an-int').send({
        name: 'Jane Doe'
      });
      expect(res.statusCode).toEqual(400);
    });
  });
});
