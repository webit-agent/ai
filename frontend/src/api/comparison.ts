import apiClient from './client';

export interface CompetitorComparison {
  id: string;
  name: string;
  products: Array<{
    id: string;
    name: string;
    url: string;
    lastPrice: number | null;
    currency: string | null;
    lastStatus: string;
  }>;
}

export async function getComparison(competitorIds: string[]): Promise<{ competitors: CompetitorComparison[] }> {
  const query = competitorIds.map(id => `ids=${id}`).join('&');
  const res = await apiClient.get(`/comparison?${query}`);
  return res.data;
}
