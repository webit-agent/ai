import pool from '../index';
import { v4 as uuidv4 } from 'uuid';

export async function createPriceHistory(trackedProductId: string, price: number | null, currency: string | null, rawHtmlSnapshot: string) {
  const id = uuidv4();
  const res = await pool.query(
    'INSERT INTO price_history (id, tracked_product_id, price, currency, raw_html_snapshot) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [id, trackedProductId, price, currency, rawHtmlSnapshot]
  );
  return res.rows[0];
}

export async function getPriceHistoryByProductId(trackedProductId: string, limit: number = 100) {
  const res = await pool.query(
    'SELECT * FROM price_history WHERE tracked_product_id = $1 ORDER BY scraped_at DESC LIMIT $2',
    [trackedProductId, limit]
  );
  return res.rows;
}

export async function getLastPriceByProductId(trackedProductId: string) {
  const res = await pool.query(
    'SELECT * FROM price_history WHERE tracked_product_id = $1 ORDER BY scraped_at DESC LIMIT 1',
    [trackedProductId]
  );
  return res.rows[0];
}
