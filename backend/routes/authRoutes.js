const express = require('express');
const router = express.Router();
const { loginUser, registerUser, getUserProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', loginUser);
router.post('/register', registerUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
