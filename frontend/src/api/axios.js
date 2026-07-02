import axios from 'axios';
import { getToken } from '../utils/localStorage';

const api = axios.create({
  baseURL: import.meta.env.PROD 
    ? 'https://events-rxq1.onrender.com/api' 
    : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
