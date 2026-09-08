import { checkUrlStatus, scrapeUrl } from './scraper';

export interface LinkCheckResult {
  url: string;
  isValid: boolean;
  isProductPage: boolean;
  statusCode?: number;
  error?: string;
  checkedAt: Date;
}

export async function checkLink(url: string): Promise<LinkCheckResult> {
  const status = await checkUrlStatus(url);
  if (!status.isValid) {
    return {
      url,
      isValid: false,
      isProductPage: false,
      statusCode: status.statusCode,
      error: status.error,
      checkedAt: new Date()
    };
  }

  // Fetch full HTML to validate it's still a product page
  try {
    const scraped = await scrapeUrl(url);
    const isProduct = isValidProductPage(url, scraped.html);
    return {
      url,
      isValid: true,
      isProductPage: isProduct,
      statusCode: scraped.statusCode,
      checkedAt: new Date()
    };
  } catch (err: any) {
    return {
      url,
      isValid: false,
      isProductPage: false,
      statusCode: status.statusCode,
      error: err.message,
      checkedAt: new Date()
    };
  }
}

/**
 * Heuristic check: determines if a scraped page looks like a real product page.
 * Checks for price indicators, product title patterns, and add-to-cart signals.
 */
export function isValidProductPage(url: string, html: string): boolean {
  if (!html || html.length < 500) return false;

  const lower = html.toLowerCase();

  // Hard negative signals — likely an error or redirect page
  const errorPatterns = ['404', 'page not found', 'this page does not exist', 'product not available', 'out of stock permanently'];
  const hasError = errorPatterns.some(p => lower.includes(p));
  if (hasError) return false;

  // Positive signals — price or buy buttons
  const positiveSignals = [
    lower.includes('price') || lower.includes('$') || lower.includes('€') || lower.includes('£'),
    lower.includes('add to cart') || lower.includes('buy now') || lower.includes('add to bag'),
    lower.includes('itemprop="price"') || lower.includes('data-price') || lower.includes('class="price"'),
    lower.includes('application/ld+json') && lower.includes('"product"')
  ];

  // Require at least 2 positive signals for confidence
  const positiveCount = positiveSignals.filter(Boolean).length;
  return positiveCount >= 2;
}

export async function batchCheckLinks(urls: string[], concurrency: number = 5): Promise<LinkCheckResult[]> {
  const results: LinkCheckResult[] = [];
  for (let i = 0; i < urls.length; i += concurrency) {
    const chunk = urls.slice(i, i + concurrency);
    const chunkResults = await Promise.all(chunk.map(checkLink));
    results.push(...chunkResults);
  }
  return results;
}
