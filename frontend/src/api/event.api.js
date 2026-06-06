import api from './axios';

// Create event
export const createEvent = async (eventData) => {
  const response = await api.post('/event', eventData);
  return response.data;
};

// Retrieve own events (for the logged-in organizer)
export const getOwnEvents = async () => {
  const response = await api.get('/event/my-events');
  return response.data;
};

// Update event details
export const updateEvent = async (id, eventData) => {
  const response = await api.put(`/event/${id}`, eventData);
  return response.data;
};

// Delete an event
export const deleteEvent = async (id) => {
  const response = await api.delete(`/event/${id}`);
  return response.data;
};

// Retrieve all bookings/registrations for events managed by the organizer
export const getEventBookings = async () => {
  const response = await api.get('/booking/event-bookings');
  return response.data;
};

// Retrieve all public events
export const getPublicEvents = async () => {
  const response = await api.get('/events/public');
  return response.data;
};

// Create a booking (public flow)
export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

// Retrieve bookings for the logged-in organizer
export const getOrganizerBookings = async () => {
  const response = await api.get('/organizer/bookings');
  return response.data;
};
