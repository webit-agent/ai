import pool from '../index';
import { v4 as uuidv4 } from 'uuid';

export async function createCompetitorQuery(userId: string, name: string, websiteUrl: string) {
  const id = uuidv4();
  const res = await pool.query(
    'INSERT INTO competitors (id, user_id, name, website_url) VALUES ($1, $2, $3, $4) RETURNING *',
    [id, userId, name, websiteUrl]
  );
  return res.rows[0];
}

export async function getCompetitorsByUserId(userId: string) {
  const res = await pool.query('SELECT * FROM competitors WHERE user_id = $1', [userId]);
  return res.rows;
}

export async function getCompetitorByIdAndUserId(id: string, userId: string) {
  const res = await pool.query('SELECT * FROM competitors WHERE id = $1 AND user_id = $2', [id, userId]);
  return res.rows[0];
}

export async function deleteCompetitorQuery(id: string, userId: string) {
  await pool.query('DELETE FROM competitors WHERE id = $1 AND user_id = $2', [id, userId]);
}
