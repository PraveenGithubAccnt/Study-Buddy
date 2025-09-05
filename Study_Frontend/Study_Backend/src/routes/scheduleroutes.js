const express = require('express');
const router = express.Router();

// Import middleware
const { verifyToken } = require('../middleware/authmiddleware');

// Import controllers
const {
  createSchedule,
  getSchedules,
  getUpcomingTasks,
  updateSchedule,
  deleteSchedule,
  getScheduleStats
} = require('../controllers/schedulecontroller');

// Import validation
const {
  validateCreateSchedule,
  validateUpdateSchedule,
  validateGetSchedules,
  validateDeleteSchedule
} = require('../utils/scheduleValidation');

// 🔐 All routes are protected (require authentication)
router.use(verifyToken);

// 📋 GET ROUTES
// Get upcoming tasks (next 7 days)
router.get('/upcoming', getUpcomingTasks);

// Get schedule statistics
router.get('/stats', getScheduleStats);

// Get all schedules with optional filters
router.get('/', validateGetSchedules, getSchedules);

// 📝 POST ROUTES
// Create new schedule
router.post('/', validateCreateSchedule, createSchedule);

// 🔄 PUT ROUTES
// Update existing schedule
router.put('/:id', validateUpdateSchedule, updateSchedule);

// 🗑️ DELETE ROUTES
// Delete schedule
router.delete('/:id', validateDeleteSchedule, deleteSchedule);

module.exports = router;