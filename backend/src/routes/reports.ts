import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getUserCompetitors } from '../services/competitorService';
import { getPriceHistoryByProductId } from '../db/queries/priceHistory';
import { getUserById } from '../db/queries/users';
import { generatePdfReport, ReportData } from '../tools/pdfReporter';

const router = Router();
router.use(authMiddleware);

/**
 * GET /api/reports/weekly.pdf
 * Generates and streams a PDF report for the last 7 days.
 */
router.get('/weekly.pdf', async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await getUserById(req.userId!);
    const competitors = await getUserCompetitors(req.userId!);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const periodLabel = `Weekly Report — ${weekAgo.toLocaleDateString()} to ${now.toLocaleDateString()}`;

    const reportData: ReportData = {
      generatedAt: now,
      userEmail: user.email,
      periodLabel,
      competitors: await Promise.all(
        competitors.map(async (comp: any) => ({
          name: comp.name,
          websiteUrl: comp.website_url,
          products: await Promise.all(
            (comp.products || []).map(async (prod: any) => {
              const history = await getPriceHistoryByProductId(prod.id, 50);
              const filtered = history.filter(
                (h: any) => new Date(h.scraped_at) >= weekAgo
              );
              return {
                name: prod.name,
                url: prod.url,
                lastStatus: prod.last_status || 'unknown',
                priceHistory: filtered.map((h: any) => ({
                  price: parseFloat(h.price),
                  currency: h.currency || 'USD',
                  scrapedAt: new Date(h.scraped_at)
                }))
              };
            })
          )
        }))
      )
    };

    const pdfBuffer = await generatePdfReport(reportData);

    const filename = `competitor-report-${now.toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length.toString());
    res.end(pdfBuffer);
  } catch (err) { next(err); }
});

export default router;
