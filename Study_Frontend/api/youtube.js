// api/youtube.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://study-buddy-production-69c4.up.railway.app/api/youtube';

const youtubeApiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = await AsyncStorage.getItem('userToken');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'YouTube API call failed');
  }

  return data;
};

// 🔍 Basic YouTube Search
export const fetchYouTubeVideos = async (query, maxResults = 8) => {
  const response = await youtubeApiCall('/search', {
    method: 'POST',
    body: JSON.stringify({ query, maxResults }),
  });

  return Array.isArray(response.data.results) ? response.data.results : [];
};

// 🎬 Advanced YouTube Search
export const advancedYouTubeSearch = async ({
  query,
  subject = '',
  level = '',
  duration = 'medium',
  maxResults = 8,
  order = 'relevance',
  channelType = 'any'
}) => {
  return await youtubeApiCall('/advanced', {
    method: 'POST',
    body: JSON.stringify({ query, subject, level, duration, maxResults, order, channelType }),
  });
};

// 📊 Get Video Details
export const getVideoDetails = async (videoIds = []) => {
  return await youtubeApiCall('/details', {
    method: 'POST',
    body: JSON.stringify({ videoIds }),
  });
};
