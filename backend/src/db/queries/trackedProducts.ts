import pool from '../index';
import { v4 as uuidv4 } from 'uuid';

export async function createTrackedProduct(competitorId: string, userId: string, name: string, url: string) {
  const id = uuidv4();
  const res = await pool.query(
    'INSERT INTO tracked_products (id, competitor_id, user_id, name, url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [id, competitorId, userId, name, url]
  );
  return res.rows[0];
}

export async function getProductsByUserId(userId: string) {
  const res = await pool.query('SELECT * FROM tracked_products WHERE user_id = $1', [userId]);
  return res.rows;
}

export async function getProductByIdAndUserId(id: string, userId: string) {
  const res = await pool.query('SELECT * FROM tracked_products WHERE id = $1 AND user_id = $2', [id, userId]);
  return res.rows[0];
}

export async function updateProductStatus(id: string, status: string, checkedAt: Date) {
  const res = await pool.query(
    'UPDATE tracked_products SET last_status = $1, last_checked_at = $2 WHERE id = $3 RETURNING *',
    [status, checkedAt, id]
  );
  return res.rows[0];
}

export async function setProductActive(id: string, userId: string, isActive: boolean) {
  const res = await pool.query(
    'UPDATE tracked_products SET is_active = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
    [isActive, id, userId]
  );
  return res.rows[0];
}

export async function getActiveProducts() {
  const res = await pool.query('SELECT * FROM tracked_products WHERE is_active = true');
  return res.rows;
}

export async function deleteProduct(id: string, userId: string) {
  await pool.query('DELETE FROM tracked_products WHERE id = $1 AND user_id = $2', [id, userId]);
}
