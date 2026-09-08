import apiClient from './client';

export const login = async (data: any) => {
  const res = await apiClient.post('/auth/login', data);
  return res.data;
};

export const register = async (data: any) => {
  const res = await apiClient.post('/auth/register', data);
  return res.data;
};

export const getMe = async () => {
  const res = await apiClient.get('/auth/me');
  return res.data;
};
