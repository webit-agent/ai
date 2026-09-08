import apiClient from './client';

export const getCompetitors = async () => {
  const res = await apiClient.get('/competitors');
  return res.data;
};

export const createCompetitor = async (data: any) => {
  const res = await apiClient.post('/competitors', data);
  return res.data;
};

export const deleteCompetitor = async (id: string) => {
  const res = await apiClient.delete(`/competitors/${id}`);
  return res.data;
};
