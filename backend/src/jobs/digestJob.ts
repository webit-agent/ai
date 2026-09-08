import pool from '../db/index';
import { getAllUsers } from '../db/queries/users';
import { getSettingsByUserId } from '../db/queries/notificationSettings';
import { sendDigestEmail, DigestData } from '../tools/notifier';

export async function runDailyDigestJob(): Promise<void> {
  const users = await getAllUsers();
  
  for (const user of users) {
    const settings = await getSettingsByUserId(user.id);
    if (settings?.email_alerts === false) continue;

    // Get unread alerts from the past 24 hours for this user
    const res = await pool.query(`
      SELECT a.*, p.name as product_name, p.url as product_url, c.name as competitor_name
      FROM alerts a
      JOIN tracked_products p ON a.product_id = p.id
      JOIN competitors c ON p.competitor_id = c.id
      WHERE a.user_id = $1 AND a.is_read = false AND a.created_at >= NOW() - INTERVAL '24 HOURS'
    `, [user.id]);
    
    if (res.rows.length === 0) continue;
    
    const alerts = res.rows.map(row => ({
      productName: row.product_name,
      productUrl: row.product_url,
      competitorName: row.competitor_name,
      alertType: row.alert_type,
      oldValue: row.old_value,
      newValue: row.new_value,
      sentAt: row.created_at
    }));

    const digestData: DigestData = {
      userEmail: user.email,
      alerts,
      periodLabel: 'Last 24 hours'
    };

    await sendDigestEmail(user.email, digestData);
    // Do NOT mark as read, user reads them in dashboard
  }
}
