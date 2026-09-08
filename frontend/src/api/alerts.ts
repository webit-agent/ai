import apiClient from './client';

export const getAlerts = async (unreadOnly = false) => {
  const res = await apiClient.get(`/alerts?unread=${unreadOnly}`);
  return res.data;
};

export const markAlertRead = async (id: string) => {
  const res = await apiClient.patch(`/alerts/${id}/read`);
  return res.data;
};

export const markAllRead = async () => {
  const res = await apiClient.patch('/alerts/read-all');
  return res.data;
};
