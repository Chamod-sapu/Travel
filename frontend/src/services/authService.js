import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/api/users/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/api/users/register', userData);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/api/users/profile');
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getAllUsers = async () => {
  const response = await api.get('/api/users/all');
  return response.data;
};
