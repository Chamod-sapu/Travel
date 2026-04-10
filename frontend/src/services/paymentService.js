import api from './api';

export const initiatePayment = async (paymentData) => {
  const response = await api.post('/api/payments/initiate', paymentData);
  return response.data;
};

export const getMyPayments = async () => {
  const response = await api.get('/api/payments/my');
  return response.data;
};
