import apiClient from './client';

export const addProduct = async (data: any) => {
  const res = await apiClient.post('/products', data);
  return res.data;
};

export const getProduct = async (id: string) => {
  const res = await apiClient.get(`/products/${id}`);
  return res.data;
};

export const triggerCheck = async (id: string) => {
  const res = await apiClient.post(`/products/${id}/check`);
  return res.data;
};

export const updateProduct = async (id: string, data: any) => {
  const res = await apiClient.patch(`/products/${id}`, data);
  return res.data;
};

export const getProductHistory = async (id: string) => {
  const res = await apiClient.get(`/products/${id}/history`);
  return res.data;
};

export const deleteProduct = async (id: string) => {
  const res = await apiClient.delete(`/products/${id}`);
  return res.data;
};
