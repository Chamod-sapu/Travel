import api from './api';

export const searchFlights = async (params) => {
  const response = await api.get('/api/flights/search', { params });
  return response.data;
};

export const bookFlight = async (bookingData) => {
  const response = await api.post('/api/flights/book', bookingData);
  return response.data;
};

export const getMyFlightBookings = async () => {
  const response = await api.get('/api/flights/bookings/my');
  return response.data;
};

export const createFlight = async (data) => {
  const response = await api.post('/api/flights', data);
  return response.data;
};

export const updateFlight = async (id, data) => {
  const response = await api.put(`/api/flights/${id}`, data);
  return response.data;
};

export const deleteFlight = async (id) => {
  await api.delete(`/api/flights/${id}`);
};

export const getAllFlightBookings = async () => {
  const response = await api.get('/api/flights/bookings/all');
  return response.data;
};
