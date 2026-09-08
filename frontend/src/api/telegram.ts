import apiClient from './client';

export interface TelegramLinkResponse {
  token: string;
  botUrl: string;
}

/**
 * Requests a one-time Telegram link token from the backend.
 * Returns the bot deep-link URL to open in browser/Telegram.
 */
export async function getTelegramLinkUrl(): Promise<TelegramLinkResponse> {
  const res = await apiClient.post('/telegram/link-token');
  return res.data;
}
