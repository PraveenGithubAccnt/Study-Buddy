const express = require('express');
const router = express.Router();

// Import controllers
const {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser,
  updateUserProfile,
  forgotPassword  // 🔥 NEW: Add this
} = require('../controllers/authcontroller');

// Import middleware
const { verifyToken } = require('../middleware/authmiddleware');

// Import validation
const { 
  validateRegistration, 
  validateLogin,
  validateForgotPassword  // 🔥 NEW: Add this
} = require('../utils/authvalidation');

// 📝 POST /api/auth/register - Register a new user
router.post('/register', validateRegistration, registerUser);

// 🔐 POST /api/auth/login - Login user
router.post('/login', validateLogin, loginUser);

// 🔄 POST /api/auth/forgot-password - Send password reset email
router.post('/forgot-password', validateForgotPassword, forgotPassword);

// 👤 GET /api/auth/profile - Get user profile (Protected)
router.get('/profile', verifyToken, getUserProfile);

// 🔄 PUT /api/auth/update-profile - Update user profile (Protected)
router.put('/update-profile', verifyToken, updateUserProfile);

// 🔓 POST /api/auth/logout - Logout user (Protected)
router.post('/logout', verifyToken, logoutUser);

// 🔄 GET /api/auth/verify - Verify if token is valid (Protected)
router.get('/verify', verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    user: req.user
  });
});

module.exports = router;