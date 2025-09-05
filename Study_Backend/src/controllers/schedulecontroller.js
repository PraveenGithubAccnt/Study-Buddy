const { firestore } = require('../config/firebase');
const { validationResult } = require('express-validator');

// 📅 CREATE STUDY SCHEDULE
const createSchedule = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.userId; // From auth middleware
    const { subject, topic, date, time, description, priority } = req.body;

    // Create schedule data
    const scheduleData = {
      subject,
      topic,
      date,
      time,
      description: description || '',
      priority: priority || 'medium', // low, medium, high
      status: 'pending', // pending, completed, missed
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId
    };

    // Add to Firestore
    const scheduleRef = await firestore
      .collection('schedules')
      .add(scheduleData);

    // Get the created schedule with ID
    const createdSchedule = {
      id: scheduleRef.id,
      ...scheduleData
    };

    res.status(201).json({
      success: true,
      message: 'Study schedule created successfully',
      data: {
        schedule: createdSchedule
      }
    });

  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create study schedule'
    });
  }
};

// 📋 GET USER'S SCHEDULES (with filtering options)
const getSchedules = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, date, subject, limit = 50 } = req.query;

    // Build query
    let query = firestore
      .collection('schedules')
      .where('userId', '==', userId);

    // Add filters if provided
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (date) {
      query = query.where('date', '==', date);
    }
    
    if (subject) {
      query = query.where('subject', '==', subject);
    }

    // Order by date and time
    query = query.orderBy('date', 'asc').orderBy('time', 'asc');

    // Limit results
    query = query.limit(parseInt(limit));

    const snapshot = await query.get();
    
    const schedules = [];
    snapshot.forEach(doc => {
      schedules.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      success: true,
      message: 'Schedules retrieved successfully',
      data: {
        schedules,
        count: schedules.length
      }
    });

  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve schedules'
    });
  }
};

// 📖 GET UPCOMING TASKS (Next 7 days)
const getUpcomingTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get current date and 7 days from now
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    const snapshot = await firestore
      .collection('schedules')
      .where('userId', '==', userId)
      .where('date', '>=', todayStr)
      .where('date', '<=', nextWeekStr)
      .where('status', '==', 'pending')
      .orderBy('date', 'asc')
      .orderBy('time', 'asc')
      .limit(20)
      .get();

    const upcomingTasks = [];
    snapshot.forEach(doc => {
      upcomingTasks.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      success: true,
      message: 'Upcoming tasks retrieved successfully',
      data: {
        tasks: upcomingTasks,
        count: upcomingTasks.length
      }
    });

  } catch (error) {
    console.error('Get upcoming tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve upcoming tasks'
    });
  }
};

// 📝 UPDATE SCHEDULE
const updateSchedule = async (req, res) => {
  try {
    const userId = req.user.userId;
    const scheduleId = req.params.id;
    const updateData = req.body;

    // Check if schedule exists and belongs to user
    const scheduleDoc = await firestore
      .collection('schedules')
      .doc(scheduleId)
      .get();

    if (!scheduleDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    const scheduleData = scheduleDoc.data();
    if (scheduleData.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this schedule'
      });
    }

    // Prepare update data
    const allowedFields = ['subject', 'topic', 'date', 'time', 'description', 'priority', 'status'];
    const filteredUpdateData = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredUpdateData[field] = updateData[field];
      }
    });

    filteredUpdateData.updatedAt = new Date().toISOString();

    // Update the schedule
    await firestore
      .collection('schedules')
      .doc(scheduleId)
      .update(filteredUpdateData);

    // Get updated schedule
    const updatedDoc = await firestore
      .collection('schedules')
      .doc(scheduleId)
      .get();

    res.status(200).json({
      success: true,
      message: 'Schedule updated successfully',
      data: {
        schedule: {
          id: scheduleId,
          ...updatedDoc.data()
        }
      }
    });

  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update schedule'
    });
  }
};

// 🗑️ DELETE SCHEDULE
const deleteSchedule = async (req, res) => {
  try {
    const userId = req.user.userId;
    const scheduleId = req.params.id;

    // Check if schedule exists and belongs to user
    const scheduleDoc = await firestore
      .collection('schedules')
      .doc(scheduleId)
      .get();

    if (!scheduleDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    const scheduleData = scheduleDoc.data();
    if (scheduleData.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this schedule'
      });
    }

    // Delete the schedule
    await firestore
      .collection('schedules')
      .doc(scheduleId)
      .delete();

    res.status(200).json({
      success: true,
      message: 'Schedule deleted successfully'
    });

  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete schedule'
    });
  }
};

// 📊 GET SCHEDULE STATS
const getScheduleStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all schedules for stats
    const snapshot = await firestore
      .collection('schedules')
      .where('userId', '==', userId)
      .get();

    let totalSchedules = 0;
    let pendingTasks = 0;
    let completedTasks = 0;
    let missedTasks = 0;
    const subjectCount = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      totalSchedules++;
      
      // Count by status
      switch (data.status) {
        case 'pending':
          pendingTasks++;
          break;
        case 'completed':
          completedTasks++;
          break;
        case 'missed':
          missedTasks++;
          break;
      }

      // Count by subject
      if (subjectCount[data.subject]) {
        subjectCount[data.subject]++;
      } else {
        subjectCount[data.subject] = 1;
      }
    });

    res.status(200).json({
      success: true,
      message: 'Schedule stats retrieved successfully',
      data: {
        stats: {
          totalSchedules,
          pendingTasks,
          completedTasks,
          missedTasks,
          subjectBreakdown: subjectCount
        }
      }
    });

  } catch (error) {
    console.error('Get schedule stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve schedule stats'
    });
  }
};

module.exports = {
  createSchedule,
  getSchedules,
  getUpcomingTasks,
  updateSchedule,
  deleteSchedule,
  getScheduleStats
};