import { createCompetitorQuery, getCompetitorsByUserId, getCompetitorByIdAndUserId, deleteCompetitorQuery } from '../db/queries/competitors';
import { getProductsByUserId, setProductActive } from '../db/queries/trackedProducts';

export async function createCompetitor(userId: string, name: string, websiteUrl: string) {
  return await createCompetitorQuery(userId, name, websiteUrl);
}

export async function getUserCompetitors(userId: string) {
  const comps = await getCompetitorsByUserId(userId);
  const prods = await getProductsByUserId(userId);
  
  return comps.map(c => {
    return {
      ...c,
      products: prods.filter(p => p.competitor_id === c.id)
    };
  });
}

export async function deleteCompetitor(id: string, userId: string) {
  const prods = await getProductsByUserId(userId);
  const compProds = prods.filter(p => p.competitor_id === id);
  for (const p of compProds) {
    await setProductActive(p.id, userId, false);
  }
  await deleteCompetitorQuery(id, userId);
}
