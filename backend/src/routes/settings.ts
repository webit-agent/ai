import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getSettingsByUserId, upsertSettings } from '../db/queries/notificationSettings';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const settings = await getSettingsByUserId(req.userId!);
    if (!settings) {
      return res.json({ email_alerts: true, telegram_alerts: false, alert_threshold_percent: 0 });
    }
    res.json(settings);
  } catch (err) { next(err); }
});

const updateSchema = z.object({
  body: z.object({
    email_alerts: z.boolean(),
    telegram_alerts: z.boolean(),
    alert_threshold_percent: z.number().min(0).max(100)
  })
});

router.put('/', validate(updateSchema), async (req: AuthRequest, res, next) => {
  try {
    const settings = await upsertSettings(req.userId!, req.body);
    res.json(settings);
  } catch (err) { next(err); }
});

export default router;
