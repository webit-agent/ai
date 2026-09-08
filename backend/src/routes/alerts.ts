import { Router } from 'express';
import { getUserAlerts, markAlertRead, markAllAlertsRead } from '../services/alertService';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const unread = req.query.unread === 'true';
    const alerts = await getUserAlerts(req.userId!, unread);
    res.json(alerts);
  } catch (err) { next(err); }
});

router.patch('/read-all', async (req: AuthRequest, res, next) => {
  try {
    await markAllAlertsRead(req.userId!);
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.patch('/:id/read', async (req: AuthRequest, res, next) => {
  try {
    const alert = await markAlertRead(req.params.id, req.userId!);
    res.json(alert);
  } catch (err) { next(err); }
});

export default router;
