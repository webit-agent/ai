import apiClient from './client';

export interface ContentSnapshot {
  id: string;
  competitor_id: string;
  screenshot_path: string;
  page_hash: string;
  taken_at: string;
  change_detected: boolean;
}

export async function getSnapshots(competitorId: string): Promise<ContentSnapshot[]> {
  const res = await apiClient.get(`/snapshots/${competitorId}`);
  return res.data;
}

export function getLatestScreenshotUrl(competitorId: string): string {
  // Use the base URL from the API client
  const baseUrl = import.meta.env.VITE_API_URL || '/api';
  return `${baseUrl}/snapshots/${competitorId}/latest.png`;
}
