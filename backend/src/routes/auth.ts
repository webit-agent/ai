import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { createUser, getUserByEmail, getUserById } from '../db/queries/users';
import { hashPassword, verifyPassword, generateToken } from '../services/auth';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  })
});

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const existing = await getUserByEmail(email);
    if (existing) return res.status(400).json({ error: 'Email in use' });
    
    const hashed = await hashPassword(password);
    const user = await createUser(email, hashed);
    const token = generateToken(user.id, user.email);
    
    res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch (err) { next(err); }
});

router.post('/login', validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
    
    const token = generateToken(user.id, user.email);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) { next(err); }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const user = await getUserById(req.userId!);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, email: user.email, telegram_chat_id: user.telegram_chat_id });
  } catch (err) { next(err); }
});

export default router;
