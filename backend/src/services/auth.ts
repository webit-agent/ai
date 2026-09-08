import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateToken(userId: string, email: string): string {
  const secret = process.env.JWT_SECRET || 'secret';
  return jwt.sign({ userId, email }, secret, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string; email: string } {
  const secret = process.env.JWT_SECRET || 'secret';
  return jwt.verify(token, secret) as { userId: string; email: string };
}
