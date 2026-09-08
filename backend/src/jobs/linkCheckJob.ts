import { getActiveProducts, updateProductStatus } from '../db/queries/trackedProducts';
import { createAlert } from '../db/queries/alerts';
import { getUserById } from '../db/queries/users';
import { getCompetitorByIdAndUserId } from '../db/queries/competitors';
import { batchCheckLinks } from '../tools/linkChecker';
import { sendEmailAlert, sendTelegramAlert } from '../tools/notifier';

export async function runLinkCheckJob(): Promise<void> {
  console.log('Starting link check job...');
  const products = await getActiveProducts();
  
  const urls = products.map(p => p.url);
  const results = await batchCheckLinks(urls);
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const res = results[i];
    
    if (!res.isValid || !res.isProductPage) {
      const user = await getUserById(product.user_id);
      const comp = await getCompetitorByIdAndUserId(product.competitor_id, product.user_id);
      
      await createAlert(product.user_id, product.id, 'broken_link', null, null);
      
      const alertData = {
        userEmail: user.email,
        productName: product.name,
        productUrl: product.url,
        competitorName: comp ? comp.name : 'Unknown',
        statusCode: res.statusCode,
        error: res.error
      };
      
      await sendEmailAlert(user.email, 'broken_link', alertData);
      if (user.telegram_chat_id) {
        await sendTelegramAlert(user.telegram_chat_id, 'broken_link', alertData);
      }
      
      await updateProductStatus(product.id, 'broken', new Date());
    }
  }
  console.log('Link check job completed.');
}
