export interface ParsedPrice {
  amount: number;
  currency: string;
  originalString: string;
}

export interface PriceComparison {
  changed: boolean;
  direction: 'up' | 'down' | 'same';
  percentChange: number;
  absoluteChange: number;
  oldPrice: ParsedPrice;
  newPrice: ParsedPrice;
}

export function parsePrice(rawString: string): ParsedPrice | null {
  if (!rawString) return null;
  const normalized = rawString.trim().toUpperCase();
  
  // Extract currency symbol or code
  let currency = 'USD';
  if (normalized.includes('€') || normalized.includes('EUR')) currency = 'EUR';
  else if (normalized.includes('£') || normalized.includes('GBP')) currency = 'GBP';
  
  // Replace anything that is not a digit, period, or comma
  const numbersOnly = normalized.replace(/[^0-9.,]/g, '');
  if (!numbersOnly) return null;
  
  // Handle European formats (e.g. 1.299,00) vs US formats (e.g. 1,299.00)
  let amountStr = numbersOnly;
  const lastComma = amountStr.lastIndexOf(',');
  const lastDot = amountStr.lastIndexOf('.');
  
  if (lastComma > lastDot && lastComma !== -1) {
    // Likely European: 1.299,00 -> 1299.00
    amountStr = amountStr.replace(/\./g, '').replace(',', '.');
  } else if (lastDot > lastComma && lastDot !== -1) {
    // Likely US: 1,299.00 -> 1299.00
    amountStr = amountStr.replace(/,/g, '');
  } else if (lastComma !== -1 && lastDot === -1) {
    // Only comma
    amountStr = amountStr.replace(',', '.');
  }
  
  const amount = parseFloat(amountStr);
  if (isNaN(amount)) return null;
  
  return {
    amount,
    currency,
    originalString: rawString
  };
}

export function normalizeCurrency(currency: string): string {
  const map: Record<string, string> = {
    '$': 'USD', '€': 'EUR', '£': 'GBP',
    'USD': 'USD', 'EUR': 'EUR', 'GBP': 'GBP'
  };
  return map[currency.toUpperCase()] || currency.toUpperCase();
}

export function comparePrices(oldPrice: ParsedPrice, newPrice: ParsedPrice): PriceComparison {
  const absoluteChange = newPrice.amount - oldPrice.amount;
  let percentChange = 0;
  if (oldPrice.amount !== 0) {
    percentChange = (absoluteChange / oldPrice.amount) * 100;
  }
  
  let direction: 'up' | 'down' | 'same' = 'same';
  if (absoluteChange > 0) direction = 'up';
  if (absoluteChange < 0) direction = 'down';
  
  return {
    changed: absoluteChange !== 0,
    direction,
    percentChange: parseFloat(percentChange.toFixed(2)),
    absoluteChange: parseFloat(absoluteChange.toFixed(2)),
    oldPrice,
    newPrice
  };
}
