// api/reranksearch.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://study-buddy-production-69c4.up.railway.app/api/rerank';

const rerankApiCall = async (endpoint, options = {}) => {
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
    throw new Error(data.message || 'Rerank API call failed');
  }

  return data.data || {};
};

// 🔄 Rerank Search Results (simplified for StudyScreen)
export const rerankResults = async (query, items, type = 'video', maxResults = 5) => {
  const payload = type === 'video'
    ? { query, videoResults: items, maxResults }
    : { query, pdfResults: items, maxResults };

  const result = await rerankApiCall('/rerank', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return Array.isArray(result.rerankedResults) ? result.rerankedResults : [];
};

// 🎯 Smart Recommendations
export const getSmartRecommendations = async ({
  query,
  userPreferences = {},
  learningHistory = [],
  contentTypes = ['pdf', 'video'],
  maxRecommendations = 8
}) => {
  const result = await rerankApiCall('/recommend', {
    method: 'POST',
    body: JSON.stringify({ query, userPreferences, learningHistory, contentTypes, maxRecommendations }),
  });

  return Array.isArray(result.recommendations) ? result.recommendations : [];
};

// 📊 Analyze Content Quality
export const analyzeContentQuality = async (contentItems = []) => {
  const result = await rerankApiCall('/analyze', {
    method: 'POST',
    body: JSON.stringify({ contentItems }),
  });

  return Array.isArray(result.analysisResults) ? result.analysisResults : [];
};
