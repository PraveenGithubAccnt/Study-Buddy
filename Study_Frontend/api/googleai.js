import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL ='https://study-buddy-production-69c4.up.railway.app/api/googleai';

const googleAiCall = async (endpoint, options = {}) => {
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
    throw new Error(data.message || 'Google AI API call failed');
  }

  return data.data || {}; // Always return the data object
};

// 🧠 Explain Topic
export const getAIExplanation = async (query, difficulty = 'beginner') => {
  const result = await googleAiCall('/explain', {
    method: 'POST',
    body: JSON.stringify({ query, difficulty }),
  });

  return typeof result.explanation === 'string' ? result.explanation : '';
};


// 💬 AI Chat
export const aiChat = async (message, context = '', chatHistory = []) => {
  const result = await googleAiCall('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, context, chatHistory }),
  });

  return typeof result.response === 'string' ? result.response : '';
};

// 📚 Generate Study Notes
export const generateStudyNotes = async (topic, subject, noteType = 'summary') => {
  const result = await googleAiCall('/notes', {
    method: 'POST',
    body: JSON.stringify({ topic, subject, noteType }),
  });

  return typeof result.notes === 'string' ? result.notes : '';
};
