import api from './axios';

// Unified Login
export const unifiedLogin = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};
