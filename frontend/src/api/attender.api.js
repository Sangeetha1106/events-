import api from './axios';

// Attender login
export const attenderLogin = async (credentials) => {
  const response = await api.post('/attender/login', credentials);
  return response.data;
};
