import { getActiveProducts, updateProductStatus } from '../db/queries/trackedProducts';
import { getLastPriceByProductId, createPriceHistory } from '../db/queries/priceHistory';
import { getCompetitorByIdAndUserId } from '../db/queries/competitors';
import { getUserById } from '../db/queries/users';
import { createAlert } from '../db/queries/alerts';
import { getSettingsByUserId } from '../db/queries/notificationSettings';
import { scrapeUrl, extractPrice } from '../tools/scraper';
import { parsePrice, comparePrices } from '../tools/priceExtractor';
import { sendEmailAlert, sendTelegramAlert } from '../tools/notifier';

export async function runPriceCheckJob(): Promise<void> {
  console.log('Starting price check job...');
  const products = await getActiveProducts();
  
  for (const product of products) {
    try {
      const scraped = await scrapeUrl(product.url);
      const priceResult = await extractPrice(scraped.html, product.url);
      
      let currentPriceStr = priceResult.rawText;
      let currentParsed = parsePrice(currentPriceStr);
      
      const lastPriceRec = await getLastPriceByProductId(product.id);
      
      if (currentParsed && currentParsed.amount !== null) {
        let changed = false;
        
        if (!lastPriceRec) {
          changed = true;
        } else {
          const oldParsed = { amount: parseFloat(lastPriceRec.price), currency: lastPriceRec.currency, originalString: lastPriceRec.price };
          const comp = comparePrices(oldParsed, currentParsed);
          changed = comp.changed;
          
          if (changed) {
            const user = await getUserById(product.user_id);
            const compRecord = await getCompetitorByIdAndUserId(product.competitor_id, product.user_id);
            const settings = await getSettingsByUserId(product.user_id);
            
            await createAlert(product.user_id, product.id, 'price_change', oldParsed.amount.toString(), currentParsed.amount.toString());
            
            const threshold = settings?.alert_threshold_percent ?? 0;
            
            if (Math.abs(comp.percentChange) >= threshold) {
              const alertData = {
                userEmail: user.email,
                productName: product.name,
                productUrl: product.url,
                competitorName: compRecord ? compRecord.name : 'Unknown',
                oldPrice: oldParsed.amount.toString(),
                newPrice: currentParsed.amount.toString(),
                percentChange: comp.percentChange,
                direction: comp.direction
              };
              
              if (settings?.email_alerts !== false) {
                await sendEmailAlert(user.email, 'price_change', alertData);
              }
              if (user.telegram_chat_id && settings?.telegram_alerts === true) {
                await sendTelegramAlert(user.telegram_chat_id, 'price_change', alertData);
              }
            }
          }
        }
        
        if (changed || !lastPriceRec) {
          await createPriceHistory(product.id, currentParsed.amount, currentParsed.currency, scraped.html.substring(0, 5000));
        }
        
        await updateProductStatus(product.id, 'ok', new Date());
      } else {
        await updateProductStatus(product.id, 'error: no price found', new Date());
      }
    } catch (err: any) {
      console.error(`Error checking product ${product.id}:`, err);
      await updateProductStatus(product.id, 'error', new Date());
    }
  }
  console.log('Price check job completed.');
}
