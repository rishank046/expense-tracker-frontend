import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://expense-tracker-api-5f8c.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to safely extract string error message from backend error objects
const extractErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred';

  const data = error.response?.data;

  if (data) {
    // If backend returned a raw string
    if (typeof data === 'string' && data.trim()) return data;

    // If backend returned object with message string
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }
    // If message is an object (e.g., PostgreSQL error object), inspect inner message or detail
    if (typeof data.message === 'object' && data.message !== null) {
      if (typeof data.message.detail === 'string' && data.message.detail.trim()) {
        return data.message.detail;
      }
      if (typeof data.message.message === 'string' && data.message.message.trim()) {
        return data.message.message;
      }
    }

    // Check detail field (common in Postgres & Django)
    if (typeof data.detail === 'string' && data.detail.trim()) {
      return data.detail;
    }

    // Check error field
    if (typeof data.error === 'string' && data.error.trim()) {
      return data.error;
    }
    if (typeof data.error === 'object' && data.error !== null) {
      if (typeof data.error.detail === 'string' && data.error.detail.trim()) {
        return data.error.detail;
      }
      if (typeof data.error.message === 'string' && data.error.message.trim()) {
        return data.error.message;
      }
    }

    // Check code field
    if (data.code !== undefined && data.code !== null) {
      const codeStr = String(data.code);
      if (codeStr === 'Unauthorized' || codeStr === 'No_Session_Id_Found') {
        return 'Session expired. Please log in again.';
      } else if (codeStr === 'No_User_Found') {
        return 'Invalid email or password.';
      } else if (codeStr === 'User_Already_Exists' || codeStr === '23505') {
        return 'An account with this email already exists.';
      } else if (codeStr === 'Missing_Required_Fields') {
        return 'Please fill in all required fields correctly.';
      } else if (codeStr.includes('_')) {
        return codeStr.replace(/_/g, ' ');
      }
    }

    // If data is a Postgres error object with length, name, severity, code, etc.
    if (typeof data === 'object' && data !== null) {
      if (typeof data.detail === 'string' && data.detail.trim()) {
        return data.detail;
      }
      if (typeof data.routine === 'string') {
        return `Database operation failed (${data.code || data.routine})`;
      }
      try {
        return JSON.stringify(data);
      } catch {
        return 'Server error occurred';
      }
    }
  }

  // Check top-level error.message
  if (typeof error.message === 'string' && error.message.trim()) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

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
    const formattedMessage = extractErrorMessage(error);
    return Promise.reject({
      ...error,
      customMessage: formattedMessage,
    });
  }
);

export default api;
