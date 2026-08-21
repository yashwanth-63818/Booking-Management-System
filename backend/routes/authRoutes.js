const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { loginUser, registerUser, getUserProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');

// Public routes
router.post('/login', [
  body('email').isEmail().withMessage('Please include a valid email').normalizeEmail(),
  body('password').exists().withMessage('Password is required'),
  validateRequest
], loginUser);

router.post('/register', [
  body('name').not().isEmpty().withMessage('Name is required').trim().escape(),
  body('email').isEmail().withMessage('Please include a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be 6 or more characters'),
  body('role').optional().isIn(['admin', 'manager', 'receptionist', 'housekeeping']).withMessage('Invalid role'),
  validateRequest
], registerUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
