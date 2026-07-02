import api from './axios';

export const adminLogin = async (credentials) => {
  const response = await api.post('/admin/login', credentials);
  return response.data;
};

// Fetch all organizers (Admin protected test route)
export const getOrganizers = async () => {
    const response = await api.get('/admin/organizers'); 
    return response.data;
};

// Create new organizer
export const createOrganizer = async (organizerData) => {
    const response = await api.post('/admin/organizer', organizerData);
    return response.data;
};

export const updateOrganizer = async (id, organizerData) => {
    const response = await api.put(`/admin/organizer/${id}`, organizerData);
    return response.data;
};

export const deleteOrganizer = async (id) => {
    const response = await api.delete(`/admin/organizer/${id}`);
    return response.data;
};
