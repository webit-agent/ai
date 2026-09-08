import { createTrackedProduct, getProductByIdAndUserId, setProductActive, updateProductStatus } from '../db/queries/trackedProducts';
import { scrapeUrl, extractPrice } from '../tools/scraper';
import { parsePrice } from '../tools/priceExtractor';
import { createPriceHistory, getPriceHistoryByProductId, getLastPriceByProductId } from '../db/queries/priceHistory';

export async function addTrackedProduct(competitorId: string, userId: string, name: string, url: string) {
  const product = await createTrackedProduct(competitorId, userId, name, url);
  await triggerManualCheck(product.id, userId);
  return product;
}

export async function getProductHistory(productId: string, userId: string, limit: number = 100) {
  return await getPriceHistoryByProductId(productId, limit);
}

export async function triggerManualCheck(productId: string, userId: string) {
  const product = await getProductByIdAndUserId(productId, userId);
  if (!product) throw new Error('Product not found');
  
  const scraped = await scrapeUrl(product.url);
  const priceResult = await extractPrice(scraped.html, product.url);
  const currentParsed = parsePrice(priceResult.rawText);
  
  if (currentParsed && currentParsed.amount !== null) {
    await createPriceHistory(product.id, currentParsed.amount, currentParsed.currency, scraped.html.substring(0, 5000));
    await updateProductStatus(product.id, 'ok', new Date());
  } else {
    await updateProductStatus(product.id, 'error: no price found', new Date());
  }
}

export async function toggleProductActive(productId: string, userId: string, isActive: boolean) {
  return await setProductActive(productId, userId, isActive);
}
