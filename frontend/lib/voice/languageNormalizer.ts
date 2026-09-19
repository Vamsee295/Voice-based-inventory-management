export const numberMap: Record<string, number> = {
  'okati': 1, 'okkata': 1, 'oka': 1, 'one': 1,
  'rendu': 2, 'rend': 2, 'two': 2,
  'moodu': 3, 'mud': 3, 'three': 3,
  'naalugu': 4, 'nalugu': 4, 'four': 4,
  'aidu': 5, 'ayidu': 5, 'five': 5,
  'aaru': 6, 'six': 6,
  'edu': 7, 'yedu': 7, 'seven': 7,
  'enimidi': 8, 'yenimidi': 8, 'eight': 8,
  'tommidi': 9, 'thommidi': 9, 'nine': 9,
  'padi': 10, 'ten': 10,
  'iravai': 20, 'twenty': 20,
  'muppai': 30, 'thirty': 30,
  'nalabhai': 40, 'forty': 40,
  'yaabhai': 50, 'fifty': 50,
  'aravai': 60, 'sixty': 60,
  'debhai': 70, 'seventy': 70,
  'enabhai': 80, 'eighty': 80,
  'thombhai': 90, 'ninety': 90,
  'vanda': 100, 'hundred': 100
};

export const actionVerbMap: Record<string, string> = {
  // STOCK_IN
  'add': 'STOCK_IN',
  'vachayi': 'STOCK_IN',
  'vachindi': 'STOCK_IN',
  'ochindi': 'STOCK_IN',
  'techukunnam': 'STOCK_IN',
  'receive': 'STOCK_IN',
  'brought': 'STOCK_IN',
  'in': 'STOCK_IN',
  
  // STOCK_OUT
  'remove': 'STOCK_OUT',
  'ammam': 'STOCK_OUT',
  'ammamu': 'STOCK_OUT',
  'vellayi': 'STOCK_OUT',
  'poindi': 'STOCK_OUT',
  'sold': 'STOCK_OUT',
  'dispatch': 'STOCK_OUT',
  'out': 'STOCK_OUT',

  // QUERIES
  'entha': 'STOCK_LOOKUP',
  'undi': 'STOCK_LOOKUP',
  'unnayi': 'STOCK_LOOKUP',
  'undha': 'STOCK_LOOKUP',
  'unnaya': 'STOCK_LOOKUP',
  'how much': 'STOCK_LOOKUP',
  'how many': 'STOCK_LOOKUP',
  'what is': 'STOCK_LOOKUP',
  'show': 'STOCK_LOOKUP',
  'status': 'STOCK_LOOKUP',

  // LOW STOCK QUERIES
  'thakkuva': 'LOW_STOCK_QUERY',
  'low': 'LOW_STOCK_QUERY',
  'shortage': 'LOW_STOCK_QUERY',
  'reorder': 'REORDER_QUERY',
  
  // HISTORY
  'last': 'STOCK_HISTORY',
  'history': 'STOCK_HISTORY',
  'recent': 'STOCK_HISTORY',
};

export const unitMap: Record<string, string> = {
  'బస్తా': 'Bags', 'basta': 'Bags', 'bag': 'Bags', 'bags': 'Bags',
  'ప్యాకెట్': 'Packets', 'packet': 'Packets', 'packets': 'Packets', 'pkt': 'Packets',
  'డబ్బా': 'Tins', 'dabba': 'Tins', 'tin': 'Tins', 'tins': 'Tins',
  'లీటర్': 'Liters', 'liter': 'Liters', 'liters': 'Liters', 'ltr': 'Liters',
  'కిలో': 'kg', 'kg': 'kg', 'kgs': 'kg', 'kilo': 'kg', 'kilogram': 'kg'
};

export class LanguageNormalizer {
  
  static normalizeNumber(word: string): number | null {
    const w = word.toLowerCase();
    if (!isNaN(Number(w))) return Number(w);
    return numberMap[w] || null;
  }
  
  static normalizeAction(words: string[]): string | null {
    const joined = words.join(' ').toLowerCase();
    
    // Explicit phrase match
    if (joined.includes('which items are low')) return 'LOW_STOCK_QUERY';
    
    if (joined.includes('how much') || joined.includes('how many') || joined.includes('what is')) {
        return 'STOCK_LOOKUP';
    }
    
    // Word-by-word intent detection
    let detectedIntent = null;
    
    for (const w of words) {
      const lower = w.toLowerCase();
      if (actionVerbMap[lower]) {
        // If we found LOW_STOCK_QUERY, it usually overrides simple lookups
        if (actionVerbMap[lower] === 'LOW_STOCK_QUERY') return 'LOW_STOCK_QUERY';
        detectedIntent = actionVerbMap[lower];
      }
    }
    return detectedIntent;
  }
  
  static normalizeUnit(word: string): string | null {
    const w = word.toLowerCase();
    return unitMap[w] || null;
  }
}
