const express = require('express');
const cors = require('cors');
const path = require('path');
const { errorHandler } = require('./middleware/errorMiddleware');

// Import routes (will be created soon)
const authRoutes = require('./routes/authRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const roomRoutes = require('./routes/roomRoutes');
const guestRoutes = require('./routes/guestRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const { protect } = require('./middleware/authMiddleware');

// Base Routes
app.use('/api/auth', authRoutes); // Auth routes manage their own protection
app.use('/api/invoices', protect, invoiceRoutes);
app.use('/api/dashboard', protect, dashboardRoutes);
app.use('/api/notifications', protect, notificationRoutes);
app.use('/api/bookings', protect, bookingRoutes);
app.use('/api/rooms', protect, roomRoutes);
app.use('/api/guests', protect, guestRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Backend is running correctly.' });
});

// Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;
