import api from './axios';

// Attender registration
export const attenderRegister = async (data) => {
  const response = await api.post('/attender/register', data);
  return response.data;
};

// Attender login
export const attenderLogin = async (credentials) => {
  const response = await api.post('/attender/login', credentials);
  return response.data;
};

// Retrieve profile details
export const getAttenderProfile = async () => {
  const response = await api.get('/attender/profile');
  return response.data;
};

// Update profile details
export const updateAttenderProfile = async (profileData) => {
  const response = await api.put('/attender/profile', profileData);
  return response.data;
};

// Retrieve booking history
export const getAttenderBookingHistory = async () => {
  const response = await api.get('/booking/history');
  return response.data;
};

// Book tickets for an event
export const bookTickets = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

// View all organizers
export const getAttenderOrganizers = async () => {
  const response = await api.get('/attender/organizers');
  return response.data;
};

// View organizer details
export const getAttenderOrganizerDetails = async (id) => {
  const response = await api.get(`/attender/organizers/${id}`);
  return response.data;
};

// Organizer: Update an attendee
export const organizerUpdateAttender = async (id, data) => {
  const response = await api.put(`/attender/${id}`, data);
  return response.data;
};

// Organizer: Delete an attendee
export const organizerDeleteAttender = async (id) => {
  const response = await api.delete(`/attender/${id}`);
  return response.data;
};
