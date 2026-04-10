import api from './api';

export const searchHotels = async (params) => {
  const response = await api.get('/api/hotels/search', { params });
  return response.data;
};

export const bookHotel = async (bookingData) => {
  const response = await api.post('/api/hotels/book', bookingData);
  return response.data;
};

export const getMyHotelBookings = async () => {
  const response = await api.get('/api/hotels/bookings/my');
  return response.data;
};

export const createHotel = async (data) => {
  const response = await api.post('/api/hotels', data);
  return response.data;
};

export const updateHotel = async (id, data) => {
  const response = await api.put(`/api/hotels/${id}`, data);
  return response.data;
};

export const deleteHotel = async (id) => {
  await api.delete(`/api/hotels/${id}`);
};

export const getAllHotelBookings = async () => {
  const response = await api.get('/api/hotels/bookings/all');
  return response.data;
};
