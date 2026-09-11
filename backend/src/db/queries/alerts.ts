import pool from '../index';
import { v4 as uuidv4 } from 'uuid';

export async function createAlert(userId: string, trackedProductId: string, alertType: string, oldValue: string | null, newValue: string | null) {
  const id = uuidv4();
  const res = await pool.query(
    'INSERT INTO alerts (id, user_id, tracked_product_id, alert_type, old_value, new_value, sent_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
    [id, userId, trackedProductId, alertType, oldValue, newValue]
  );
  return res.rows[0];
}

export async function getAlertsByUserId(userId: string, unreadOnly: boolean = false) {
  let query = `
    SELECT 
      a.*,
      p.id as product_id,
      p.name as product_name,
      p.url as product_url,
      c.name as competitor_name
    FROM alerts a
    LEFT JOIN tracked_products p ON a.tracked_product_id = p.id
    LEFT JOIN competitors c ON p.competitor_id = c.id
    WHERE a.user_id = $1
  `;
  if (unreadOnly) {
    query += ' AND a.read_at IS NULL';
  }
  query += ' ORDER BY a.sent_at DESC';
  const res = await pool.query(query, [userId]);
  return res.rows.map(row => ({
    ...row,
    product: row.product_id ? { id: row.product_id, name: row.product_name, url: row.product_url } : null,
    competitor_name: row.competitor_name || null,
  }));
}

export async function markAlertAsRead(id: string, userId: string) {
  const res = await pool.query(
    'UPDATE alerts SET read_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *',
    [id, userId]
  );
  return res.rows[0];
}

export async function markAllAlertsAsRead(userId: string) {
  await pool.query('UPDATE alerts SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL', [userId]);
}
