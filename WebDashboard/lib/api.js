import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Role-based request validation
export const fetchPatients = async (role) => {
  try {
    const response = await api.get('/patients', {
      params: { role },
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error('Access denied: Insufficient permissions');
    }
    throw error;
  }
};

// HIPAA-compliant data handling
export const updatePatientRecord = async (id, updates) => {
  try {
    const response = await api.patch(`/patients/${id}`, updates, {
      headers: {
        'Content-Type': 'application/merge-patch+json',
        'X-Request-ID': generateRequestId()
      }
    });
    return response.data;
  } catch (error) {
    handleHIPAAError(error);
    throw error;
  }
};
