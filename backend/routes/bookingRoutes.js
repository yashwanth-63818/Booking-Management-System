const express = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validationMiddleware');
const { 
  getBookings, 
  exportBookings,
  getBookingById, 
  createBooking, 
  updateBooking, 
  deleteBooking 
} = require('../controllers/bookingController');
const router = express.Router();

const bookingValidationRules = [
  body('customerName').trim().notEmpty().withMessage('Customer Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('room').trim().notEmpty().withMessage('Room is required'),
  body('checkIn').isISO8601().withMessage('Invalid Check-in date'),
  body('checkOut').isISO8601().withMessage('Invalid Check-out date'),
  body('guests').optional().isInt({ min: 1 }).withMessage('Must have at least 1 guest')
];

router.get('/', getBookings);
router.get('/export', exportBookings);
router.post('/', bookingValidationRules, validateRequest, createBooking);
router.get('/:id', getBookingById);
router.put('/:id', bookingValidationRules, validateRequest, updateBooking);
router.delete('/:id', deleteBooking);

module.exports = router;
