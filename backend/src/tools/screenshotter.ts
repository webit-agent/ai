import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface ScreenshotResult {
  url: string;
  screenshotPath: string;  // relative path under screenshots/
  hash: string;            // SHA-256 of the screenshot bytes
  takenAt: Date;
}

export interface DiffResult {
  changed: boolean;
  oldHash: string;
  newHash: string;
  percentDifferent: number; // 0-100 estimated from hash distance
  screenshotPath: string;
}

const SCREENSHOTS_DIR = process.env.SCREENSHOTS_DIR || path.join(process.cwd(), 'screenshots');

/** Ensures the screenshots directory exists */
function ensureDir() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

/**
 * Takes a full-page screenshot of a URL and saves it to disk.
 * Returns path and SHA-256 hash of the image.
 */
export async function takeScreenshot(url: string, competitorId: string): Promise<ScreenshotResult> {
  ensureDir();
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const filename = `${competitorId}_${Date.now()}.png`;
    const screenshotPath = path.join(SCREENSHOTS_DIR, filename);
    await page.screenshot({ path: screenshotPath as `${string}.png`, fullPage: true });

    const bytes = fs.readFileSync(screenshotPath);
    const hash = crypto.createHash('sha256').update(bytes).digest('hex');

    return { url, screenshotPath: filename, hash, takenAt: new Date() };
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Compares two screenshot hashes.
 * If hashes differ, the pages have changed.
 * Returns a basic DiffResult. For full pixel diffing, a library like pixelmatch would be used.
 */
export function compareScreenshots(oldHash: string, newHash: string, newScreenshotPath: string): DiffResult {
  const changed = oldHash !== newHash;
  // Estimate difference by comparing hash bytes (rough heuristic)
  let diffCount = 0;
  const len = Math.min(oldHash.length, newHash.length);
  for (let i = 0; i < len; i++) {
    if (oldHash[i] !== newHash[i]) diffCount++;
  }
  const percentDifferent = changed ? Math.max(5, (diffCount / len) * 100) : 0;

  return { changed, oldHash, newHash, percentDifferent: parseFloat(percentDifferent.toFixed(1)), screenshotPath: newScreenshotPath };
}
