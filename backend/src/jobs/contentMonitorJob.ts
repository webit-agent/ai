import { getCompetitorsByUserId } from '../db/queries/competitors';
import { getAllUsers } from '../db/queries/users';
import { createSnapshot, getLatestSnapshot } from '../db/queries/contentSnapshots';
import { createAlert } from '../db/queries/alerts';
import { getUserById } from '../db/queries/users';
import { takeScreenshot, compareScreenshots } from '../tools/screenshotter';
import { sendEmailAlert } from '../tools/notifier';

export async function runContentMonitorJob(): Promise<void> {
  console.log('[ContentMonitor] Starting content monitor job...');
  const users = await getAllUsers();

  for (const user of users) {
    const competitors = await getCompetitorsByUserId(user.id);

    for (const competitor of competitors) {
      if (!competitor.website_url) continue;

      try {
        const newShot = await takeScreenshot(competitor.website_url, competitor.id);
        const lastSnapshot = await getLatestSnapshot(competitor.id);

        let changeDetected = false;

        if (lastSnapshot) {
          const diff = compareScreenshots(lastSnapshot.page_hash, newShot.hash, newShot.screenshotPath);
          changeDetected = diff.changed;

          if (changeDetected) {
            console.log(`[ContentMonitor] Change detected on ${competitor.name} (${diff.percentDifferent}% different)`);

            await createAlert(
              user.id,
              competitor.id,  // using competitor.id as a proxy (no product_id for homepage)
              'content_change',
              lastSnapshot.page_hash.substring(0, 8),
              newShot.hash.substring(0, 8)
            );

            const userRecord = await getUserById(user.id);
            if (userRecord) {
              await sendEmailAlert(userRecord.email, 'broken_link', {
                userEmail: userRecord.email,
                productName: `${competitor.name} homepage`,
                productUrl: competitor.website_url,
                competitorName: competitor.name,
                error: `Page changed significantly (estimated ${diff.percentDifferent}% different from last snapshot)`
              });
            }
          }
        }

        await createSnapshot(competitor.id, newShot.screenshotPath, newShot.hash, changeDetected);
      } catch (err: any) {
        console.error(`[ContentMonitor] Error monitoring ${competitor.name}:`, err.message);
      }
    }
  }

  console.log('[ContentMonitor] Content monitor job finished.');
}
