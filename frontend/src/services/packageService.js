import api from './api';

export const getPackages = async (params) => {
  const response = await api.get('/api/packages', { params });
  return response.data;
};

export const bookPackage = async (bookingData) => {
  const response = await api.post('/api/packages/book', bookingData);
  return response.data;
};

export const getMyPackageBookings = async () => {
  const response = await api.get('/api/packages/bookings/my');
  return response.data;
};

export const createPackage = async (data) => {
  const response = await api.post('/api/packages', data);
  return response.data;
};

export const updatePackage = async (id, data) => {
  const response = await api.put(`/api/packages/${id}`, data);
  return response.data;
};

export const deletePackage = async (id) => {
  await api.delete(`/api/packages/${id}`);
};

export const getAllPackageBookings = async () => {
  const response = await api.get('/api/packages/bookings/all');
  return response.data;
};
