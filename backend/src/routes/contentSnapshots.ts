import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getSnapshotHistory } from '../db/queries/contentSnapshots';
import * as path from 'path';
import * as fs from 'fs';

const router = Router();
router.use(authMiddleware);

/** GET /api/snapshots/:competitorId — return snapshot history */
router.get('/:competitorId', async (req: AuthRequest, res, next) => {
  try {
    const history = await getSnapshotHistory(req.params.competitorId, 20);
    res.json(history);
  } catch (err) { next(err); }
});

/** GET /api/snapshots/:competitorId/latest.png — serve latest screenshot image */
router.get('/:competitorId/latest.png', async (req: AuthRequest, res, next) => {
  try {
    const { getLatestSnapshot } = await import('../db/queries/contentSnapshots');
    const snap = await getLatestSnapshot(req.params.competitorId);
    if (!snap) return res.status(404).json({ error: 'No screenshot available' });

    const screenshotsDir = process.env.SCREENSHOTS_DIR || path.join(process.cwd(), 'screenshots');
    const filePath = path.join(screenshotsDir, snap.screenshot_path);

    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Screenshot file not found' });
    res.setHeader('Content-Type', 'image/png');
    fs.createReadStream(filePath).pipe(res);
  } catch (err) { next(err); }
});

export default router;
