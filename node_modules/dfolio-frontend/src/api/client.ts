import axios from 'axios';

const client = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || '', // Configurable via environment variable in production, falls back to relative paths for local dev proxy
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach authorization token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dfolio_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept responses to handle authentication failures
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if session expires
      localStorage.removeItem('dfolio_token');
      localStorage.removeItem('dfolio_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
