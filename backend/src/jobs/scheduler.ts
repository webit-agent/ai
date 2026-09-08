import cron from 'node-cron';
import { runPriceCheckJob } from './priceCheckJob';
import { runLinkCheckJob } from './linkCheckJob';
import { runDailyDigestJob } from './digestJob';
import { runContentMonitorJob } from './contentMonitorJob';

export function startScheduler(): void {
  console.log('Starting scheduler...');
  
  cron.schedule('0 */2 * * *', async () => {
    console.log(`[${new Date().toISOString()}] Running scheduled price check...`);
    await runPriceCheckJob();
    console.log(`[${new Date().toISOString()}] Price check finished.`);
  });
  
  cron.schedule('0 */6 * * *', async () => {
    console.log(`[${new Date().toISOString()}] Running scheduled link check...`);
    await runLinkCheckJob();
    console.log(`[${new Date().toISOString()}] Link check finished.`);
  });
  
  cron.schedule('0 8 * * *', async () => {
    console.log(`[${new Date().toISOString()}] Running daily digest...`);
    await runDailyDigestJob();
    console.log(`[${new Date().toISOString()}] Daily digest finished.`);
  });

  cron.schedule('0 2 * * *', async () => {
    console.log(`[${new Date().toISOString()}] Running content monitor job...`);
    await runContentMonitorJob();
    console.log(`[${new Date().toISOString()}] Content monitor job finished.`);
  });
}
