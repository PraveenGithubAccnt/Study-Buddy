// api/pdfsearch.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.29.93:3000/api/pdf';

const pdfApiCall = async (endpoint, options = {}) => {
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
    throw new Error(data.message || 'PDF API call failed');
  }

  return data;
};

// 🔍 Basic PDF Search
export const fetchPDFs = async (query, maxResults = 8) => {
  const response = await pdfApiCall('/search', {
    method: 'POST',
    body: JSON.stringify({ query, maxResults }),
  });

  console.log("📄 Raw PDF response:", response);

  return Array.isArray(response.data.results) ? response.data.results : [];
};

// 🔍 Advanced PDF Search
export const advancedPDFSearch = async ({
  query,
  subject = '',
  level = '',
  maxResults = 8,
  excludeSites = []
}) => {
  return await pdfApiCall('/advanced', {
    method: 'POST',
    body: JSON.stringify({ query, subject, level, maxResults, excludeSites }),
  });
};
