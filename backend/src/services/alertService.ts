import { getAlertsByUserId, markAlertAsRead, markAllAlertsAsRead } from '../db/queries/alerts';

export async function getUserAlerts(userId: string, unreadOnly: boolean = false) {
  return await getAlertsByUserId(userId, unreadOnly);
}

export async function markAlertRead(alertId: string, userId: string) {
  return await markAlertAsRead(alertId, userId);
}

export async function markAllAlertsRead(userId: string) {
  await markAllAlertsAsRead(userId);
}
