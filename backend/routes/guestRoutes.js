const express = require('express');
const { body, param } = require('express-validator');
const { validateRequest } = require('../middleware/validationMiddleware');
const router = express.Router();
const {
  getGuests,
  updateGuest,
  extendStay,
  checkOutGuest
} = require('../controllers/guestController');

const guestValidationRules = [
  body('name').optional().trim().isString().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').optional().isEmail().withMessage('Must be a valid email'),
  body('phone').optional().trim().isString().isLength({ min: 5, max: 20 }),
  body('idType').optional().isString(),
  body('idNumber').optional().isString()
];

router.route('/')
  .get(getGuests);

router.route('/:id')
  .put(param('id').isInt().withMessage('ID must be an integer'), guestValidationRules, validateRequest, updateGuest);

router.route('/:id/extend')
  .put(
    param('id').isInt().withMessage('ID must be an integer'),
    body('newCheckOutDate').isISO8601().withMessage('Invalid date format'),
    validateRequest,
    extendStay
  );

router.route('/:id/checkout')
  .put(param('id').isInt().withMessage('ID must be an integer'), validateRequest, checkOutGuest);

module.exports = router;
