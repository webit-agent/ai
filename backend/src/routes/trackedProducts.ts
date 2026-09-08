import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { addTrackedProduct, getProductHistory, triggerManualCheck, toggleProductActive } from '../services/productService';
import { deleteProduct, getProductByIdAndUserId } from '../db/queries/trackedProducts';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

const addSchema = z.object({
  body: z.object({
    competitorId: z.string().uuid(),
    name: z.string(),
    url: z.string().url()
  })
});

router.post('/', validate(addSchema), async (req: AuthRequest, res, next) => {
  try {
    const { competitorId, name, url } = req.body;
    const prod = await addTrackedProduct(competitorId, req.userId!, name, url);
    res.status(201).json(prod);
  } catch (err) { next(err); }
});

router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const prod = await getProductByIdAndUserId(req.params.id, req.userId!);
    if (!prod) return res.status(404).json({ error: 'Not found' });
    res.json(prod);
  } catch (err) { next(err); }
});

import { scrapeLimiter } from '../middleware/rateLimit';

router.post('/:id/check', scrapeLimiter, async (req: AuthRequest, res, next) => {
  try {
    await triggerManualCheck(req.params.id, req.userId!);
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive === 'boolean') {
      const updated = await toggleProductActive(req.params.id, req.userId!, isActive);
      return res.json(updated);
    }
    res.status(400).json({ error: 'Invalid update' });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    await deleteProduct(req.params.id, req.userId!);
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
