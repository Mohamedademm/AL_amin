import axios from 'axios';

// Single axios instance pointed at the API, with JWT + 401 handling.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach the stored bearer token to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On an expired/invalid session (401 with a token present), force re-login.
// Auth endpoints are excluded so failed logins keep their inline error.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error.config?.url || '';
    const isAuthCall = url.includes('/auth/login') || url.includes('/auth/register');
    if (error.response?.status === 401 && localStorage.getItem('token') && !isAuthCall) {
      localStorage.removeItem('token');
      if (!window.location.pathname.startsWith('/login')) window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
