import apiClient from './client';

export const getProductInsight = async (id: string) => {
  const res = await apiClient.get(`/insights/product/${id}`);
  return res.data;
};

export const getCompetitorInsight = async (id: string) => {
  const res = await apiClient.get(`/insights/competitor/${id}`);
  return res.data;
};

export async function getProductPatterns(productId: string): Promise<{ patterns: string[]; confidence: number; nextExpectedChange?: string }> {
  const res = await apiClient.get(`/insights/product/${productId}/patterns`);
  return res.data;
}
