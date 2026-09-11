import { Router } from 'express';
import { getProductHistory } from '../services/productService';
import { getUserCompetitors } from '../services/competitorService';
import { generatePriceChangeSummary, generateCompetitorReport, detectPricingPatterns } from '../tools/aiInsights';
import { getProductByIdAndUserId } from '../db/queries/trackedProducts';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/product/:id', async (req: AuthRequest, res, next) => {
  try {
    const product = await getProductByIdAndUserId(req.params.id, req.userId!);
    if (!product) return res.status(404).json({ error: 'Not found' });
    
    const history = await getProductHistory(product.id, req.userId!);
    const points = history.map(h => ({ price: parseFloat(h.price), currency: h.currency, scrapedAt: h.scraped_at }));
    const summary = await generatePriceChangeSummary(product.name, points);
    res.json({ summary });
  } catch (err) { next(err); }
});

router.get('/product/:id/patterns', async (req: AuthRequest, res, next) => {
  try {
    const product = await getProductByIdAndUserId(req.params.id, req.userId!);
    if (!product) return res.status(404).json({ error: 'Not found' });

    const history = await getProductHistory(product.id, req.userId!);
    const points = history.map(h => ({ price: parseFloat(h.price), currency: h.currency, scrapedAt: new Date(h.scraped_at) }));
    const patterns = await detectPricingPatterns(points);
    res.json(patterns);
  } catch (err) { next(err); }
});


router.get('/competitor/:id', async (req: AuthRequest, res, next) => {
  try {
    const comps = await getUserCompetitors(req.userId!);
    const comp = comps.find(c => c.id === req.params.id);
    if (!comp) return res.status(404).json({ error: 'Not found' });
    
    // Quick shape mapping
    const mapped = {
      name: comp.name,
      url: comp.website_url,
      products: comp.products.map((p: any) => ({ name: p.name, url: p.url, priceHistory: [] })) // simplified
    };
    
    const report = await generateCompetitorReport(mapped);
    res.json({ report });
  } catch (err) { next(err); }
});

export default router;
