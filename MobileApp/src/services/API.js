import axios from 'axios';
import { retrieveToken } from './auth';
import { encryptData } from './encryption';

const api = axios.create({
  baseURL: process.env.API_BASE_URL,
  timeout: 10000,
});

// Request interceptor for auth token
api.interceptors.request.use(async (config) => {
  const token = await retrieveToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// Response interceptor for handling errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle token expiration
    }
    return Promise.reject(error);
  }
);

// Secure data submission
export const submitDailyLog = async (logData) => {
  try {
    const encryptedData = encryptData(logData);
    const response = await api.post('/logs', encryptedData);
    return response.data;
  } catch (error) {
    // Store offline if network error
    if (error.message.includes('Network Error')) {
      await storeOfflineLog(logData);
      return { success: true, offline: true };
    }
    throw error;
  }
};

// Store logs offline
const storeOfflineLog = async (logData) => {
  const offlineLogs = await AsyncStorage.getItem('offlineLogs') || '[]';
  const logs = JSON.parse(offlineLogs);
  logs.push({ ...logData, timestamp: new Date() });
  await AsyncStorage.setItem('offlineLogs', JSON.stringify(logs));
};
