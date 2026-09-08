import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface PricePoint { price: number; currency: string; scrapedAt: Date; }
export interface CompetitorData { name: string; url: string; products: Array<{ name: string; url: string; priceHistory: PricePoint[]; }>; }
export interface PatternAnalysis { patterns: string[]; confidence: number; nextExpectedChange?: string; }

export async function generatePriceChangeSummary(productName: string, priceHistory: PricePoint[]): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) return 'AI insights disabled.';
  const prompt = `Analyze this price history for ${productName}: ${JSON.stringify(priceHistory)}. Give a concise summary.`;
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 150,
    messages: [{ role: 'user', content: prompt }]
  });
  return response.content[0].type === 'text' ? response.content[0].text : 'No insights generated.';
}

export async function generateCompetitorReport(competitor: CompetitorData): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) return 'AI insights disabled.';
  const prompt = `Analyze competitor ${competitor.name}. Data: ${JSON.stringify(competitor)}. Summarize strategy.`;
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 250,
    messages: [{ role: 'user', content: prompt }]
  });
  return response.content[0].type === 'text' ? response.content[0].text : 'No insights generated.';
}

export async function detectPricingPatterns(history: PricePoint[]): Promise<PatternAnalysis> {
  if (!process.env.ANTHROPIC_API_KEY || history.length < 3) {
    return { patterns: ['Not enough data to detect patterns (need at least 3 data points).'], confidence: 0 };
  }

  // Pre-compute stats to reduce token usage
  const sorted = [...history].sort((a, b) => new Date(a.scrapedAt).getTime() - new Date(b.scrapedAt).getTime());
  const changes: { date: string; from: number; to: number; pct: string }[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (prev.price !== curr.price) {
      const pct = (((curr.price - prev.price) / prev.price) * 100).toFixed(1);
      changes.push({ date: new Date(curr.scrapedAt).toISOString().split('T')[0], from: prev.price, to: curr.price, pct: `${pct}%` });
    }
  }

  if (changes.length === 0) {
    return { patterns: ['Price has been stable with no changes detected.'], confidence: 0.9 };
  }

  const prompt = `You are a pricing analyst. Analyze these price changes and detect patterns (e.g. monthly cycles, weekend drops, seasonal discounts):

Price changes: ${JSON.stringify(changes)}

Respond with JSON only: {"patterns": ["pattern 1", "pattern 2"], "confidence": 0.0-1.0, "nextExpectedChange": "human-readable prediction or null"}`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }]
  });

  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    const parsed = JSON.parse(text);
    return {
      patterns: parsed.patterns || [],
      confidence: parsed.confidence || 0.5,
      nextExpectedChange: parsed.nextExpectedChange || undefined
    };
  } catch {
    return { patterns: ['Pattern analysis returned unexpected format.'], confidence: 0 };
  }
}
