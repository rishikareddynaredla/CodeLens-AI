import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const analyzeRepo = async (repoUrl) => {
  try {
    const response = await api.post('/repo/analyze', { repoUrl });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('An error occurred during analysis');
  }
};

export const askRepo = async (question) => {
  try {
    const response = await api.post('/repo/ask', { question });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('An error occurred while asking question');
  }
};

export const getSettings = async () => {
  try {
    const response = await api.get('/settings');
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to load settings');
  }
};

export const updateSettings = async (payload) => {
  try {
    const response = await api.put('/settings', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to save settings');
  }
};

export const clearSessionData = async () => {
  try {
    const response = await api.post('/settings/clear');
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to clear session data');
  }
};

export default api;
