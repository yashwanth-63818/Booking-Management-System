const express = require('express');
const router = express.Router();
const { createInvoice, getInvoiceById, getInvoiceByBookingId } = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

// Mount routes
router.post('/', protect, createInvoice);
router.get('/:id', protect, getInvoiceById);
router.get('/booking/:bookingId', protect, getInvoiceByBookingId);

module.exports = router;
