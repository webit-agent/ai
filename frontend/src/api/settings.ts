import apiClient from './client';

export interface NotificationSettings {
  email_alerts: boolean;
  telegram_alerts: boolean;
  alert_threshold_percent: number;
}

export async function getSettings(): Promise<NotificationSettings> {
  const res = await apiClient.get('/settings');
  return res.data;
}

export async function updateSettings(settings: NotificationSettings): Promise<NotificationSettings> {
  const res = await apiClient.patch('/settings', settings);
  return res.data;
}
