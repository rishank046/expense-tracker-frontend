import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Authorization Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error messages clearly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.response?.data?.code) {
      const code = error.response.data.code;
      if (code === 'Unauthorized' || code === 'No_Session_Id_Found') {
        message = 'Session expired. Please log in again.';
      } else if (code === 'No_User_Found') {
        message = 'Invalid email or password.';
      } else if (code === 'User_Already_Exists') {
        message = 'An account with this email already exists.';
      } else if (code === 'Missing_Required_Fields') {
        message = 'Please fill in all required fields correctly.';
      } else {
        message = code.replace(/_/g, ' ');
      }
    } else if (error.message) {
      message = error.message;
    }

    return Promise.reject({
      ...error,
      customMessage: message,
    });
  }
);

export default api;
