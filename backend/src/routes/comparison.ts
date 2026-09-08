import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import pool from '../db/index';
import { getLastPriceByProductId } from '../db/queries/priceHistory';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const idsStr = req.query.competitorIds as string;
    if (!idsStr) {
      return res.status(400).json({ error: 'competitorIds is required' });
    }
    const ids = idsStr.split(',').slice(0, 5);
    
    // Fetch competitors
    const compRes = await pool.query(
      'SELECT id, name FROM competitors WHERE id = ANY($1) AND user_id = $2',
      [ids, req.userId]
    );
    
    const result = { competitors: [] as any[] };
    
    for (const comp of compRes.rows) {
      const prodRes = await pool.query(
        'SELECT id, name, url, last_status FROM tracked_products WHERE competitor_id = $1',
        [comp.id]
      );
      
      const products = [];
      for (const prod of prodRes.rows) {
        const lastPriceRec = await getLastPriceByProductId(prod.id);
        products.push({
          id: prod.id,
          name: prod.name,
          url: prod.url,
          lastPrice: lastPriceRec ? parseFloat(lastPriceRec.price) : null,
          currency: lastPriceRec ? lastPriceRec.currency : null,
          lastStatus: prod.last_status
        });
      }
      
      result.competitors.push({
        id: comp.id,
        name: comp.name,
        products
      });
    }
    
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
