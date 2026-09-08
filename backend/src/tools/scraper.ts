import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

export interface ScrapedData {
  url: string;
  html: string;
  statusCode: number;
  loadedWithJavaScript: boolean;
  scrapedAt: Date;
}

export interface PriceResult {
  rawText: string;
  amount: number | null;
  currency: string | null;
  source: 'json-ld' | 'og-meta' | 'css-selector' | 'regex' | 'unknown';
}

export interface UrlStatus {
  isValid: boolean;
  statusCode: number;
  redirectedUrl?: string;
  error?: string;
}

export interface ChangeReport {
  hasSignificantChanges: boolean;
  addedElements: string[];
  removedElements: string[];
  textChanges: string[];
  similarityScore: number;
}

export async function scrapeUrl(url: string): Promise<ScrapedData> {
  try {
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 10000
    });
    
    // Quick check if price exists in raw html
    const html = response.data;
    if (html && (html.includes('price') || html.includes('$') || html.includes('€'))) {
      return {
        url,
        html,
        statusCode: response.status,
        loadedWithJavaScript: false,
        scrapedAt: new Date()
      };
    }
  } catch (err: any) {
    // Axios failed, fallback to puppeteer
  }

  // Fallback to Puppeteer
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const html = await page.content();
    return {
      url,
      html,
      statusCode: response?.status() || 200,
      loadedWithJavaScript: true,
      scrapedAt: new Date()
    };
  } catch (error: any) {
    throw new Error(`Scraping failed: ${error.message}`);
  } finally {
    if (browser) await browser.close();
  }
}

import { parsePrice } from './priceExtractor';

export async function extractPrice(html: string, url: string): Promise<PriceResult> {
  const $ = cheerio.load(html);
  
  // 1. JSON-LD
  const scripts = $('script[type="application/ld+json"]').toArray();
  for (const script of scripts) {
    try {
      const data = JSON.parse($(script).html() || '{}');
      const processGraph = (obj: any) => {
        if (obj['@type'] === 'Product' && obj.offers) {
          const offer = Array.isArray(obj.offers) ? obj.offers[0] : obj.offers;
          if (offer.price) {
            return {
              rawText: String(offer.price),
              amount: parseFloat(offer.price),
              currency: offer.priceCurrency || null,
              source: 'json-ld' as const
            };
          }
        }
        return null;
      };
      
      const result = Array.isArray(data) ? data.map(processGraph).find(x => x) : processGraph(data);
      if (result) return result;
    } catch(e) {}
  }
  
  // 2. OpenGraph
  const ogPrice = $('meta[property="og:price:amount"]').attr('content');
  if (ogPrice) {
    const ogCurrency = $('meta[property="og:price:currency"]').attr('content');
    return {
      rawText: ogPrice,
      amount: parseFloat(ogPrice),
      currency: ogCurrency || null,
      source: 'og-meta'
    };
  }
  
  // 3. CSS Selectors
  const selectors = ['.price', '.product-price', '[data-price]', '#price', '.woocommerce-Price-amount', '.price-box', 'span[itemprop="price"]'];
  for (const sel of selectors) {
    const el = $(sel).first();
    if (el.length > 0) {
      const text = el.text();
      const parsed = parsePrice(text);
      if (parsed) {
        return {
          rawText: text,
          amount: parsed.amount,
          currency: parsed.currency,
          source: 'css-selector'
        };
      }
    }
  }
  
  // 4. Regex fallback (very simplified)
  const textBody = $('body').text();
  const match = textBody.match(/[$€£]\s?\d+(?:[.,]\d{2})?/);
  if (match) {
    const parsed = parsePrice(match[0]);
    if (parsed) {
      return {
        rawText: match[0],
        amount: parsed.amount,
        currency: parsed.currency,
        source: 'regex'
      };
    }
  }

  return { rawText: '', amount: null, currency: null, source: 'unknown' };
}

export async function checkUrlStatus(url: string): Promise<UrlStatus> {
  try {
    const res = await axios.head(url, { maxRedirects: 5, timeout: 5000 });
    return { isValid: res.status >= 200 && res.status < 400, statusCode: res.status };
  } catch (e: any) {
    return { isValid: false, statusCode: e.response?.status || 0, error: e.message };
  }
}

/**
 * Compares two HTML snapshots and returns a ChangeReport with similarity scoring.
 * Uses Jaccard similarity on tokenized text content to detect significant changes.
 */
export function detectPageChanges(oldHtml: string, newHtml: string): ChangeReport {
  if (oldHtml === newHtml) {
    return { hasSignificantChanges: false, addedElements: [], removedElements: [], textChanges: [], similarityScore: 1 };
  }

  const extractText = (html: string): string => {
    const $ = cheerio.load(html);
    $('script, style, noscript').remove();
    return $('body').text().replace(/\s+/g, ' ').trim();
  };

  const tokenize = (text: string): Set<string> =>
    new Set(text.toLowerCase().split(/\s+/).filter(t => t.length > 2));

  const oldText = extractText(oldHtml);
  const newText = extractText(newHtml);

  const oldTokens = tokenize(oldText);
  const newTokens = tokenize(newText);

  const intersection = new Set([...oldTokens].filter(t => newTokens.has(t)));
  const union = new Set([...oldTokens, ...newTokens]);
  const similarityScore = union.size === 0 ? 1 : intersection.size / union.size;

  // Find words removed (in old but not new)
  const removedTokens = [...oldTokens].filter(t => !newTokens.has(t)).slice(0, 10);
  // Find words added (in new but not old)
  const addedTokens = [...newTokens].filter(t => !oldTokens.has(t)).slice(0, 10);

  // Extract sentence-level changes by splitting on periods
  const oldSentences = oldText.split(/[.!?]/).map(s => s.trim()).filter(s => s.length > 20);
  const newSentences = newText.split(/[.!?]/).map(s => s.trim()).filter(s => s.length > 20);
  const newSentenceSet = new Set(newSentences);
  const removedSentences = oldSentences.filter(s => !newSentenceSet.has(s)).slice(0, 3);
  const oldSentenceSet = new Set(oldSentences);
  const addedSentences = newSentences.filter(s => !oldSentenceSet.has(s)).slice(0, 3);

  return {
    hasSignificantChanges: similarityScore < 0.85,
    addedElements: addedTokens,
    removedElements: removedTokens,
    textChanges: [...removedSentences.map(s => `REMOVED: ${s}`), ...addedSentences.map(s => `ADDED: ${s}`)],
    similarityScore: parseFloat(similarityScore.toFixed(3))
  };
}
