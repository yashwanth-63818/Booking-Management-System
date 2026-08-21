const express = require('express');
const { body, param } = require('express-validator');
const { validateRequest } = require('../middleware/validationMiddleware');
const router = express.Router();
const { createInvoice, getInvoiceById, getInvoiceByBookingId } = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

const invoiceValidationRules = [
  body('bookingId').isInt().withMessage('bookingId must be an integer'),
  body('totalAmount').isNumeric().withMessage('totalAmount must be a number'),
  body('status').optional().isIn(['Paid', 'Pending', 'Overdue']).withMessage('Invalid status')
];

// Mount routes
router.post('/', protect, invoiceValidationRules, validateRequest, createInvoice);
router.get('/:id', protect, param('id').isInt().withMessage('ID must be an integer'), validateRequest, getInvoiceById);
router.get('/booking/:bookingId', protect, param('bookingId').isInt().withMessage('Booking ID must be an integer'), validateRequest, getInvoiceByBookingId);

module.exports = router;
