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

export default api;
