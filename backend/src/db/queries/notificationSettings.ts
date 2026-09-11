import pool from '../index';
import { v4 as uuidv4 } from 'uuid';

export interface NotificationSettings {
  id: string;
  user_id: string;
  email_alerts: boolean;
  telegram_alerts: boolean;
  alert_threshold_percent: number;
}

export interface UpsertSettingsInput {
  email_alerts: boolean;
  telegram_alerts: boolean;
  alert_threshold_percent: number;
}

export async function getSettingsByUserId(userId: string): Promise<NotificationSettings | null> {
  const res = await pool.query('SELECT * FROM notification_settings WHERE user_id = $1', [userId]);
  return res.rows[0] || null;
}

export async function upsertSettings(userId: string, settings: Partial<UpsertSettingsInput>): Promise<NotificationSettings> {
  const id = uuidv4();
  const res = await pool.query(
    `INSERT INTO notification_settings (id, user_id, email_alerts, telegram_alerts, alert_threshold_percent)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id) DO UPDATE SET
     email_alerts = EXCLUDED.email_alerts,
     telegram_alerts = EXCLUDED.telegram_alerts,
     alert_threshold_percent = EXCLUDED.alert_threshold_percent
     RETURNING *`,
    [id, userId, settings.email_alerts ?? true, settings.telegram_alerts ?? false, settings.alert_threshold_percent ?? 0]
  );
  return res.rows[0];
}
