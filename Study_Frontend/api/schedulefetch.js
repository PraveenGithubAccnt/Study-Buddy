import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://study-buddy-production-69c4.up.railway.app/api/tasks';
// For emulator: http://10.0.2.2:3000/api/tasks

// 🔧 Generic API call for schedules
const scheduleApiCall = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = await AsyncStorage.getItem('userToken');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      ...options,
    };

    console.log(`🌐 Schedule API Call: ${config.method || "GET"} ${url}`);

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'API call failed');
    }

    return data;
  } catch (err) {
    console.error('Schedule API Call Error:', err);
    throw err;
  }
};

// 📅 CREATE SCHEDULE
export const createSchedule = async (scheduleData) => {
  try {
    // Format data to match backend expectations
    const formattedData = {
      subject: scheduleData.subject,
      topic: scheduleData.topic,
      date: scheduleData.date, // YYYY-MM-DD format
      time: scheduleData.time, // HH:MM format
      description: scheduleData.description || '',
      priority: scheduleData.priority || 'medium'
    };

    const response = await scheduleApiCall('', {
      method: 'POST',
      body: JSON.stringify(formattedData),
    });

    console.log('✅ Schedule created:', response.data.schedule);
    return response;
  } catch (error) {
    console.error('❌ Create schedule error:', error);
    throw error;
  }
};

// 📋 GET ALL SCHEDULES (with optional filters)
export const getSchedules = async (filters = {}) => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.date) params.append('date', filters.date);
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    const response = await scheduleApiCall(endpoint);
    
    console.log(`✅ Retrieved ${response.data.schedules.length} schedules`);
    return response.data.schedules;
  } catch (error) {
    console.error('❌ Get schedules error:', error);
    throw error;
  }
};

// 📖 GET UPCOMING TASKS (Next 7 days)
export const getUpcomingTasks = async () => {
  try {
    const response = await scheduleApiCall('/upcoming');
    
    console.log(`✅ Retrieved ${response.data.tasks.length} upcoming tasks`);
    return response.data.tasks;
  } catch (error) {
    console.error('❌ Get upcoming tasks error:', error);
    throw error;
  }
};

// 📝 UPDATE SCHEDULE
export const updateSchedule = async (scheduleId, updateData) => {
  try {
    const response = await scheduleApiCall(`/${scheduleId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    console.log('✅ Schedule updated:', response.data.schedule);
    return response;
  } catch (error) {
    console.error('❌ Update schedule error:', error);
    throw error;
  }
};

// 🗑️ DELETE SCHEDULE
export const deleteSchedule = async (scheduleId) => {
  try {
    const response = await scheduleApiCall(`/${scheduleId}`, {
      method: 'DELETE',
    });

    console.log('✅ Schedule deleted');
    return response;
  } catch (error) {
    console.error('❌ Delete schedule error:', error);
    throw error;
  }
};

// 📊 GET SCHEDULE STATISTICS
export const getScheduleStats = async () => {
  try {
    const response = await scheduleApiCall('/stats');
    
    console.log('✅ Retrieved schedule stats:', response.data.stats);
    return response.data.stats;
  } catch (error) {
    console.error('❌ Get schedule stats error:', error);
    throw error;
  }
};

// 🔄 MARK SCHEDULE AS COMPLETED
export const markScheduleCompleted = async (scheduleId) => {
  try {
    return await updateSchedule(scheduleId, { status: 'completed' });
  } catch (error) {
    console.error('❌ Mark schedule completed error:', error);
    throw error;
  }
};

// ⏰ MARK SCHEDULE AS MISSED
export const markScheduleMissed = async (scheduleId) => {
  try {
    return await updateSchedule(scheduleId, { status: 'missed' });
  } catch (error) {
    console.error('❌ Mark schedule missed error:', error);
    throw error;
  }
};