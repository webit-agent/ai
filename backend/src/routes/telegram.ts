import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { generateTelegramLinkToken } from '../db/queries/users';

const router = Router();
router.use(authMiddleware);

/**
 * POST /api/telegram/link-token
 * Generates a one-time link token (valid 15 min) for Telegram account linking.
 * Returns: { token, botUrl } where botUrl is the deep link to the bot.
 */
router.post('/link-token', async (req: AuthRequest, res, next) => {
  try {
    const token = await generateTelegramLinkToken(req.userId!);
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'YourCompetitorTrackerBot';
    const botUrl = `https://t.me/${botUsername}?start=${token}`;
    res.json({ token, botUrl });
  } catch (err) { next(err); }
});

export default router;
