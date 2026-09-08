import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { createCompetitor, getUserCompetitors, deleteCompetitor } from '../services/competitorService';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const comps = await getUserCompetitors(req.userId!);
    res.json(comps);
  } catch (err) { next(err); }
});

const createSchema = z.object({
  body: z.object({
    name: z.string(),
    websiteUrl: z.string().url()
  })
});

router.post('/', validate(createSchema), async (req: AuthRequest, res, next) => {
  try {
    const { name, websiteUrl } = req.body;
    const comp = await createCompetitor(req.userId!, name, websiteUrl);
    res.status(201).json(comp);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    await deleteCompetitor(req.params.id, req.userId!);
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
