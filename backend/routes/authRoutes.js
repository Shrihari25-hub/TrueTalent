const express = require('express');
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe
} = require('../controllers/authController');
const { protect, authorize } = require('./../middleware/auth');

const router = express.Router();

router.post('/signup', register);
router.post('/register', register); 
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe); // Add this new protected route

module.exports = router;