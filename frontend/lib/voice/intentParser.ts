import { Product } from '../inventory/models/product';
import { LanguageNormalizer } from './languageNormalizer';

export type IntentType = 
  | 'STOCK_IN' 
  | 'STOCK_OUT' 
  | 'STOCK_LOOKUP' 
  | 'LOW_STOCK_QUERY' 
  | 'REORDER_QUERY' 
  | 'STOCK_HISTORY' 
  | 'EXPIRY_QUERY'
  | 'TRANSACTION_HISTORY_QUERY'
  | 'SUPPLIER_QUERY'
  | 'UNKNOWN';

export interface ParseResult {
  intent: IntentType;
  product?: Product;
  quantity?: number;
  unit?: string;
  error?: string;
  isComplete: boolean;
}

export class IntentParser {
  
  static parse(transcript: string, products: Product[]): ParseResult {
    const words = transcript.trim().split(/\s+/);
    
    // 1. Detect Intent
    let intent: IntentType = (LanguageNormalizer.normalizeAction(words) as IntentType) || 'UNKNOWN';
    
    // Special phrase overrides
    const lowerTranscript = transcript.toLowerCase();
    if (lowerTranscript.includes('which items are low') || lowerTranscript.includes('thakkuva unda')) {
        intent = 'LOW_STOCK_QUERY';
    } else if (lowerTranscript.includes('what needs to be reordered')) {
        intent = 'REORDER_QUERY';
    } else if (lowerTranscript.includes('expire') || lowerTranscript.includes('expiring')) {
        intent = 'EXPIRY_QUERY';
    } else if (lowerTranscript.includes('stock movements') || lowerTranscript.includes('transactions') || lowerTranscript.includes('today\'s stock')) {
        intent = 'TRANSACTION_HISTORY_QUERY';
    } else if (lowerTranscript.includes('receive from') || lowerTranscript.includes('supplier')) {
        intent = 'SUPPLIER_QUERY';
    }
    
    // 2. Detect Product
    let matchedProduct: Product | undefined;
    
    // Sort products by length descending so "Sona Masoori Rice" matches before "Rice"
    const sortedProducts = [...products].sort((a, b) => b.name.length - a.name.length);
    
    for (const prod of sortedProducts) {
      const prodNameLower = prod.name.toLowerCase();
      
      // Match full name
      if (lowerTranscript.includes(prodNameLower)) {
          matchedProduct = prod;
          break;
      }
      
      // Match keywords (like 'rice', 'sugar', 'salt', 'oil')
      const keywords = prodNameLower.split(' ');
      if (keywords.some(k => lowerTranscript.includes(k) && k.length > 2)) {
        matchedProduct = prod;
        break;
      }
    }

    // 3. Detect Quantity
    let quantity: number | undefined;
    for (const w of words) {
      const num = LanguageNormalizer.normalizeNumber(w);
      if (num !== null) {
        quantity = num;
        break;
      }
    }

    // 4. Detect Unit
    let unit: string | undefined;
    for (const w of words) {
      const normalizedUnit = LanguageNormalizer.normalizeUnit(w);
      if (normalizedUnit) {
        unit = normalizedUnit;
        break;
      }
    }
    
    // 5. Validation and Error handling
    const result: ParseResult = {
      intent,
      product: matchedProduct,
      quantity,
      unit,
      isComplete: false
    };

    if (intent === 'UNKNOWN') {
      result.error = 'INTENT_NOT_RECOGNIZED';
      return result;
    }
    
    if (intent === 'LOW_STOCK_QUERY' || intent === 'REORDER_QUERY' || intent === 'EXPIRY_QUERY' || intent === 'TRANSACTION_HISTORY_QUERY' || intent === 'SUPPLIER_QUERY') {
        result.isComplete = true;
        return result;
    }

    if (!matchedProduct) {
      result.error = 'PRODUCT_NOT_FOUND';
      return result;
    }

    if (intent === 'STOCK_IN' || intent === 'STOCK_OUT') {
      if (quantity === undefined) {
        result.error = 'MISSING_QUANTITY';
        return result;
      }
      if (!unit) {
        // Use base unit as fallback if not spoken? The requirements say error MISSING_UNIT.
        // Let's check the test scenarios: "Add rice" -> Missing quantity clarification
        // "Add 3 bags of rice" -> Complete
        result.error = 'MISSING_UNIT';
        return result;
      }
      
      if (intent === 'STOCK_OUT' && matchedProduct && quantity && unit) {
          // Note: we can't fully validate insufficient stock here without unit conversion,
          // so we rely on the service/UI verification panel to do the overdraft check.
      }
    }

    result.isComplete = true;
    return result;
  }
}
