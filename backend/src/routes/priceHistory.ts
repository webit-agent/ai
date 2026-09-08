import { Router } from 'express';
import { getProductHistory } from '../services/productService';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/products/:id/history', async (req: AuthRequest, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const history = await getProductHistory(req.params.id, req.userId!, limit);
    res.json(history);
  } catch (err) { next(err); }
});

export default router;
