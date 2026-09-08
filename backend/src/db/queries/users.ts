import pool from '../index';
import { v4 as uuidv4 } from 'uuid';

export async function createUser(email: string, passwordHash: string) {
  const id = uuidv4();
  const res = await pool.query(
    'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
    [id, email, passwordHash]
  );
  return res.rows[0];
}

export async function getUserByEmail(email: string) {
  const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return res.rows[0];
}

export async function getUserById(id: string) {
  const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return res.rows[0];
}

export async function getAllUsers() {
  const res = await pool.query('SELECT * FROM users');
  return res.rows;
}

/** Save Telegram chat ID for a user (used when /start is run in bot) */
export async function saveTelegramChatId(userId: string, chatId: string) {
  const res = await pool.query(
    'UPDATE users SET telegram_chat_id = $1 WHERE id = $2 RETURNING *',
    [chatId, userId]
  );
  return res.rows[0];
}

/** Generate and store a one-time link token for Telegram account linking */
export async function generateTelegramLinkToken(userId: string): Promise<string> {
  const token = uuidv4(); // use UUID as a secure random token
  await pool.query(
    'UPDATE users SET telegram_link_token = $1, telegram_link_token_expires = NOW() + INTERVAL \'15 minutes\' WHERE id = $2',
    [token, userId]
  );
  return token;
}

/** Find a user by their Telegram link token (validates it is not expired) */
export async function getUserByTelegramToken(token: string) {
  const res = await pool.query(
    'SELECT * FROM users WHERE telegram_link_token = $1 AND telegram_link_token_expires > NOW()',
    [token]
  );
  return res.rows[0] || null;
}
