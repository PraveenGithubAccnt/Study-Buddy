const { body } = require('express-validator');

// 📝 Registration validation rules
const validateRegistration = [
  body('fullname')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters'),
    
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
    
  body('profilePhotoURL')
    .optional()
    .isURL()
    .withMessage('Profile photo must be a valid URL')
];

// 🔐 Login validation rules  
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// 🔄 Forgot Password validation rules
const validateForgotPassword = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .notEmpty()
    .withMessage('Email is required')
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateForgotPassword
};