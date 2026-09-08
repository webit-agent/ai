import pool from '../index';
import { v4 as uuidv4 } from 'uuid';

export interface ContentSnapshot {
  id: string;
  competitor_id: string;
  screenshot_path: string;
  page_hash: string;
  taken_at: Date;
  change_detected: boolean;
}

export async function createSnapshot(competitorId: string, screenshotPath: string, pageHash: string, changeDetected: boolean): Promise<ContentSnapshot> {
  const id = uuidv4();
  const res = await pool.query(
    'INSERT INTO content_snapshots (id, competitor_id, screenshot_path, page_hash, change_detected) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [id, competitorId, screenshotPath, pageHash, changeDetected]
  );
  return res.rows[0];
}

export async function getLatestSnapshot(competitorId: string): Promise<ContentSnapshot | null> {
  const res = await pool.query(
    'SELECT * FROM content_snapshots WHERE competitor_id = $1 ORDER BY taken_at DESC LIMIT 1',
    [competitorId]
  );
  return res.rows[0] || null;
}

export async function getSnapshotHistory(competitorId: string, limit = 20): Promise<ContentSnapshot[]> {
  const res = await pool.query(
    'SELECT * FROM content_snapshots WHERE competitor_id = $1 ORDER BY taken_at DESC LIMIT $2',
    [competitorId, limit]
  );
  return res.rows;
}
