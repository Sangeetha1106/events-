import api from './axios';

// Organizer login
export const organizerLogin = async (credentials) => {
  const response = await api.post('/organizer/login', credentials);
  return response.data;
};
