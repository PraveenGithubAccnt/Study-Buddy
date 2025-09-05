const { body, query, param } = require('express-validator');

// 📅 CREATE SCHEDULE VALIDATION
const validateCreateSchedule = [
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Subject must be between 2 and 50 characters')
    .trim(),
  
  body('topic')
    .notEmpty()
    .withMessage('Topic is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Topic must be between 2 and 100 characters')
    .trim(),
  
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be in YYYY-MM-DD format')
    .custom((value) => {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      
      if (selectedDate < today) {
        throw new Error('Date cannot be in the past');
      }
      return true;
    }),
  
  body('time')
    .notEmpty()
    .withMessage('Time is required')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in HH:MM format (24-hour)'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .trim(),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high')
];

// 📝 UPDATE SCHEDULE VALIDATION
const validateUpdateSchedule = [
  param('id')
    .notEmpty()
    .withMessage('Schedule ID is required'),
  
  body('subject')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Subject must be between 2 and 50 characters')
    .trim(),
  
  body('topic')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Topic must be between 2 and 100 characters')
    .trim(),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in YYYY-MM-DD format')
    .custom((value) => {
      if (value) {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          throw new Error('Date cannot be in the past');
        }
      }
      return true;
    }),
  
  body('time')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in HH:MM format (24-hour)'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .trim(),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  
  body('status')
    .optional()
    .isIn(['pending', 'completed', 'missed'])
    .withMessage('Status must be pending, completed, or missed')
];

// 🔍 GET SCHEDULES QUERY VALIDATION
const validateGetSchedules = [
  query('status')
    .optional()
    .isIn(['pending', 'completed', 'missed'])
    .withMessage('Status must be pending, completed, or missed'),
  
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in YYYY-MM-DD format'),
  
  query('subject')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Subject must be between 1 and 50 characters'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// 🗑️ DELETE SCHEDULE VALIDATION
const validateDeleteSchedule = [
  param('id')
    .notEmpty()
    .withMessage('Schedule ID is required')
];

module.exports = {
  validateCreateSchedule,
  validateUpdateSchedule,
  validateGetSchedules,
  validateDeleteSchedule
};