import { create } from 'zustand';

export type TransactionType = 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';
export type TransactionSource = 'Voice' | 'Manual' | 'POS' | 'Challan OCR';
export type VoiceStatus =
  | 'IDLE'
  | 'LISTENING'
  | 'TRANSCRIBING'
  | 'UNDERSTANDING'
  | 'VALIDATING'
  | 'DISAMBIGUATING'
  | 'REVIEW'
  | 'EXECUTING'
  | 'COMPLETED'
  | 'ERROR';

// ──────────────────────────────────────────────
// Domain Types
// ──────────────────────────────────────────────

export interface TradeUnit {
  name: string;
  vernacularName?: string;
  baseMultiplier: number;
  baseUnit: string;
}

export interface Product {
  id: string;
  name: string;
  vernacularName?: string;
  sku: string;
  category: string;
  packagingType: string;
  currentStock: number;
  baseUnit: string;
  tradeUnit?: TradeUnit;
  dailyVelocity: number;
  reorderLevel: number;
  expiryAlert?: { daysLeft: number; batchCount: number };
}

export interface ExtractedEntity {
  id: string;
  // Raw parsed data
  rawPhrase: string;
  rawPhonics: string; // Telugu/vernacular phonetic match
  intent: TransactionType;
  // Matched product (null = unresolved)
  product: Product | null;
  // Quantity before normalisation
  rawQuantity: number;
  rawUnit: string;
  // TUNE normalisation result
  normalizedDelta: number;
  normalizedUnit: string;
  tuneRatio: string; // e.g. "1 Bag = 25.0 kg"
  // Stock impact
  currentStock: number;
  projectedStock: number;
  // Confidence
  intentConfidence: number;
  entityConfidence: number;
  status: 'Normalised' | 'Validated' | 'Ambiguous' | 'Error';
}

export interface DisambiguationPrompt {
  entityId: string;
  rawPhrase: string;
  options: Product[];
}

export interface Transaction {
  id: string;
  timestamp: string;
  type: TransactionType;
  productId: string;
  productName: string;
  delta: number;
  normalizedUnit: string;
  source: TransactionSource;
  note?: string;
  confirmedBy?: string;
}

export interface VoiceSessionState {
  status: VoiceStatus;
  transcript: string;
  detectedLanguage: string;
  transcriptConfidence: number;
  intentConfidence: number;
  // Parsed multi-entity result
  extractedEntities: ExtractedEntity[];
  // Active disambiguation
  disambiguation?: DisambiguationPrompt;
  // Error
  errorMessage?: string;
}

// ──────────────────────────────────────────────
// Store Interface
// ──────────────────────────────────────────────

interface InventoryState {
  products: Product[];
  transactions: Transaction[];
  voice: VoiceSessionState;

  // Voice pipeline actions
  setVoiceStatus: (status: VoiceStatus) => void;
  setTranscript: (transcript: string, lang?: string, confidence?: number) => void;
  runPipeline: (utterance: string) => void;
  resolveDisambiguation: (entityId: string, product: Product) => void;
  confirmAndCommit: () => void;
  resetVoice: () => void;

  // Inventory actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
}

// ──────────────────────────────────────────────
// Mock Inventory Data
// ──────────────────────────────────────────────

const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Sona Masoori Rice',
    vernacularName: 'సోనా మసూరి',
    sku: 'RIC-840',
    category: 'Grains & Staples',
    packagingType: 'Grain Staple / 25kg Bag',
    currentStock: 68.0,
    baseUnit: 'kg',
    tradeUnit: { name: 'Bag', vernacularName: 'బస్తా', baseMultiplier: 25, baseUnit: 'kg' },
    dailyVelocity: 7.2,
    reorderLevel: 20,
  },
  {
    id: 'p2',
    name: 'Freedom Sunflower Oil',
    vernacularName: 'ఫ్రీడమ్ నూనె',
    sku: 'OIL-112',
    category: 'Edible Oils',
    packagingType: 'Edible Oil / 15L Tin',
    currentStock: 38.0,
    baseUnit: 'L',
    tradeUnit: { name: 'Tin', vernacularName: 'డబ్బా', baseMultiplier: 15, baseUnit: 'L' },
    dailyVelocity: 1.85,
    reorderLevel: 15,
  },
  {
    id: 'p3',
    name: 'Heritage Full Cream Milk',
    vernacularName: 'పాలు ప్యాకెట్లు',
    sku: 'MLK-019',
    category: 'Dairy & Perishables',
    packagingType: 'Dairy Pouch / 500ml',
    currentStock: 12,
    baseUnit: 'pchs',
    tradeUnit: { name: 'Crate', baseMultiplier: 24, baseUnit: 'pchs' },
    dailyVelocity: 14.0,
    reorderLevel: 20,
    expiryAlert: { daysLeft: 1.5, batchCount: 3 },
  },
  {
    id: 'p4',
    name: 'Sugar Medium S-30',
    vernacularName: 'పంచదార కట్టా',
    sku: 'SUG-204',
    category: 'Grains & Staples',
    packagingType: 'Dry Commodity / 50kg Katta',
    currentStock: 145.0,
    baseUnit: 'kg',
    tradeUnit: { name: 'Katta', baseMultiplier: 50, baseUnit: 'kg' },
    dailyVelocity: 4.1,
    reorderLevel: 50,
  },
  {
    id: 'p5',
    name: 'Toor Dal',
    vernacularName: 'కందిపప్పు',
    sku: 'DAL-309',
    category: 'Pulses',
    packagingType: 'Pulse / 50kg Katta',
    currentStock: 80.0,
    baseUnit: 'kg',
    tradeUnit: { name: 'Katta', baseMultiplier: 50, baseUnit: 'kg' },
    dailyVelocity: 3.2,
    reorderLevel: 25,
  },
];

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    timestamp: new Date(Date.now() - 1000 * 60 * 52).toISOString(),
    type: 'STOCK_IN',
    productId: 'p1',
    productName: 'Sona Masoori Rice',
    delta: 50,
    normalizedUnit: 'kg',
    source: 'Voice',
    note: '"Rice rendu bags vachayi"',
    confirmedBy: 'Suresh R.',
  },
  {
    id: 't2',
    timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    type: 'STOCK_OUT',
    productId: 'p4',
    productName: 'Sugar Medium S-30',
    delta: -5,
    normalizedUnit: 'kg',
    source: 'Voice',
    note: '"5 biscuits ammamu" (Sugar)',
    confirmedBy: 'Suresh R.',
  },
  {
    id: 't3',
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    type: 'ADJUSTMENT',
    productId: 'p2',
    productName: 'Freedom Sunflower Oil',
    delta: -2,
    normalizedUnit: 'L',
    source: 'Manual',
    note: 'Stock audit check',
    confirmedBy: 'Suresh R.',
  },
];

// ──────────────────────────────────────────────
// Mock NLP Pipeline
// ──────────────────────────────────────────────

interface ParsedIntent {
  intent: TransactionType;
  items: Array<{
    rawPhrase: string;
    rawPhonics: string;
    candidateProducts: Product[];
    rawQuantity: number;
    rawUnit: string;
  }>;
  language: string;
  confidence: number;
}

function parseUtterance(text: string, products: Product[]): ParsedIntent {
  const lower = text.toLowerCase();
  let intent: TransactionType = 'STOCK_IN';
  if (
    lower.includes('ammamu') ||
    lower.includes('sell') ||
    lower.includes('stock out') ||
    lower.includes('out') ||
    lower.includes('sold')
  ) {
    intent = 'STOCK_OUT';
  }

  const language =
    /[\u0C00-\u0C7F]/.test(text) ||
    lower.includes('vachayi') ||
    lower.includes('pettandi') ||
    lower.includes('rendu') ||
    lower.includes('undi')
      ? 'Telugu + Indian English'
      : 'Indian English';

  // Split on conjunctions for multi-item
  const segments = text.split(/,|and|మరియు/i).map((s) => s.trim()).filter(Boolean);
  const items = segments.map((segment) => {
    const sl = segment.toLowerCase();
    const numMatch = segment.match(/\d+(\.\d+)?/);
    const rawQuantity = numMatch ? parseFloat(numMatch[0]) : 1;

    let rawUnit = 'units';
    let rawPhonics = '';
    if (sl.includes('bag') || sl.includes('basta') || sl.includes('బస్తా') || sl.includes('bastha')) {
      rawUnit = 'Bag';
      rawPhonics = 'రెండు బస్తాలు (rendu basta)';
    } else if (sl.includes('kg') || sl.includes('kilo')) {
      rawUnit = 'kg';
    } else if (sl.includes('tin') || sl.includes('dabba') || sl.includes('డబ్బా')) {
      rawUnit = 'Tin';
      rawPhonics = 'రెండు డబ్బాలు (rendu dabba)';
    } else if (sl.includes('katta') || sl.includes('కట్టా')) {
      rawUnit = 'Katta';
      rawPhonics = 'కట్టా (katta)';
    } else if (sl.includes('packet') || sl.includes('pack')) {
      rawUnit = 'Packet';
    } else if (sl.includes('crate')) {
      rawUnit = 'Crate';
    } else if (sl.includes('quintal') || sl.includes('quintal')) {
      rawUnit = 'Quintal';
    }

    const candidateProducts: Product[] = [];
    for (const p of products) {
      const nameMatch =
        sl.includes(p.name.split(' ')[0].toLowerCase()) ||
        sl.includes(p.name.toLowerCase()) ||
        (p.vernacularName && sl.includes(p.vernacularName.split(' ')[0]));
      if (nameMatch) candidateProducts.push(p);
    }

    // Keyword-based fallbacks
    if (candidateProducts.length === 0) {
      if (sl.includes('rice') || sl.includes('బియ్యం') || sl.includes('biyyam')) {
        candidateProducts.push(...products.filter((p) => p.category === 'Grains & Staples' && p.sku.startsWith('RIC')));
      }
      if (sl.includes('oil') || sl.includes('nune') || sl.includes('నూనె')) {
        candidateProducts.push(...products.filter((p) => p.category === 'Edible Oils'));
      }
      if (sl.includes('sugar') || sl.includes('panchadi') || sl.includes('పంచదార')) {
        candidateProducts.push(...products.filter((p) => p.sku.startsWith('SUG')));
      }
      if (sl.includes('milk') || sl.includes('palu') || sl.includes('పాలు')) {
        candidateProducts.push(...products.filter((p) => p.sku.startsWith('MLK')));
      }
      if (sl.includes('dal') || sl.includes('dhal') || sl.includes('kandipappu') || sl.includes('కందిపప్పు')) {
        candidateProducts.push(...products.filter((p) => p.sku.startsWith('DAL')));
      }
    }

    return { rawPhrase: segment, rawPhonics, candidateProducts, rawQuantity, rawUnit };
  });

  return { intent, items, language, confidence: 0.94 + Math.random() * 0.05 };
}

function buildEntities(parsed: ParsedIntent, products: Product[]): ExtractedEntity[] {
  return parsed.items.map((item, i) => {
    const product = item.candidateProducts.length === 1 ? item.candidateProducts[0] : null;
    const tuneMultiplier = product?.tradeUnit?.baseMultiplier ?? 1;
    const normalizedUnit = product?.baseUnit ?? item.rawUnit;

    let normalizedDelta = item.rawQuantity;
    let tuneRatio = `1 ${item.rawUnit} = 1 ${normalizedUnit}`;

    if (item.rawUnit === 'Bag' || item.rawUnit === 'Katta' || item.rawUnit === 'Tin') {
      normalizedDelta = item.rawQuantity * tuneMultiplier;
      tuneRatio = `1 ${item.rawUnit} = ${tuneMultiplier} ${normalizedUnit}`;
    } else if (item.rawUnit === 'Quintal') {
      normalizedDelta = item.rawQuantity * 100;
      tuneRatio = '1 Quintal = 100 kg';
    }

    const currentStock = product?.currentStock ?? 0;
    const projectedStock =
      parsed.intent === 'STOCK_OUT' ? currentStock - normalizedDelta : currentStock + normalizedDelta;

    return {
      id: `e${i}-${Date.now()}`,
      rawPhrase: item.rawPhrase,
      rawPhonics: item.rawPhonics,
      intent: parsed.intent,
      product,
      rawQuantity: item.rawQuantity,
      rawUnit: item.rawUnit,
      normalizedDelta,
      normalizedUnit,
      tuneRatio,
      currentStock,
      projectedStock,
      intentConfidence: parsed.confidence,
      entityConfidence: item.candidateProducts.length === 1 ? 0.97 : item.candidateProducts.length > 1 ? 0.62 : 0.3,
      status:
        item.candidateProducts.length > 1
          ? 'Ambiguous'
          : item.candidateProducts.length === 0
          ? 'Error'
          : 'Validated',
    };
  });
}

// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────

const INITIAL_VOICE: VoiceSessionState = {
  status: 'IDLE',
  transcript: '',
  detectedLanguage: 'Telugu + Indian English',
  transcriptConfidence: 0,
  intentConfidence: 0,
  extractedEntities: [],
};

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: PRODUCTS,
  transactions: SEED_TRANSACTIONS,
  voice: INITIAL_VOICE,

  setVoiceStatus: (status) =>
    set((s) => ({ voice: { ...s.voice, status } })),

  setTranscript: (transcript, lang, confidence) =>
    set((s) => ({
      voice: {
        ...s.voice,
        transcript,
        detectedLanguage: lang ?? s.voice.detectedLanguage,
        transcriptConfidence: confidence ?? s.voice.transcriptConfidence,
      },
    })),

  runPipeline: (utterance: string) => {
    const products = get().products;

    // 1. TRANSCRIBING
    set((s) => ({
      voice: {
        ...s.voice,
        status: 'TRANSCRIBING',
        transcript: utterance,
        extractedEntities: [],
        disambiguation: undefined,
        errorMessage: undefined,
      },
    }));

    // 2. UNDERSTANDING
    setTimeout(() => {
      set((s) => ({ voice: { ...s.voice, status: 'UNDERSTANDING' } }));
    }, 600);

    // 3. VALIDATING + entity extraction
    setTimeout(() => {
      const parsed = parseUtterance(utterance, products);
      const entities = buildEntities(parsed, products);

      set((s) => ({
        voice: {
          ...s.voice,
          status: 'VALIDATING',
          detectedLanguage: parsed.language,
          transcriptConfidence: parsed.confidence,
          intentConfidence: parsed.confidence,
          extractedEntities: entities,
        },
      }));

      // 4. Check for disambiguation need
      setTimeout(() => {
        const ambiguous = entities.find((e) => e.status === 'Ambiguous');
        const errored = entities.find((e) => e.status === 'Error');

        if (ambiguous) {
          const parsedItem = parseUtterance(utterance, products).items.find(
            (_, i) => entities[i]?.id === ambiguous.id || true
          );
          // Build option list from utterance candidates
          const candidates = products.filter(
            (p) =>
              p.sku.startsWith('RIC') ||
              (utterance.toLowerCase().includes('oil') && p.category === 'Edible Oils')
          );

          set((s) => ({
            voice: {
              ...s.voice,
              status: 'DISAMBIGUATING',
              disambiguation: {
                entityId: ambiguous.id,
                rawPhrase: ambiguous.rawPhrase,
                options: candidates.length > 1 ? candidates : products.slice(0, 3),
              },
            },
          }));
        } else if (errored) {
          set((s) => ({
            voice: {
              ...s.voice,
              status: 'ERROR',
              errorMessage: `Could not match a product for: "${errored.rawPhrase}". Please try again with a specific product name.`,
            },
          }));
        } else {
          set((s) => ({ voice: { ...s.voice, status: 'REVIEW' } }));
        }
      }, 900);
    }, 1400);
  },

  resolveDisambiguation: (entityId, product) => {
    set((s) => {
      const updatedEntities = s.voice.extractedEntities.map((e) => {
        if (e.id === entityId) {
          const tuneMultiplier = product.tradeUnit?.baseMultiplier ?? 1;
          const normalizedDelta =
            e.rawUnit === 'Bag' || e.rawUnit === 'Katta' || e.rawUnit === 'Tin'
              ? e.rawQuantity * tuneMultiplier
              : e.rawQuantity;
          const projectedStock =
            e.intent === 'STOCK_OUT'
              ? product.currentStock - normalizedDelta
              : product.currentStock + normalizedDelta;

          return {
            ...e,
            product,
            normalizedDelta,
            normalizedUnit: product.baseUnit,
            tuneRatio: `1 ${e.rawUnit} = ${tuneMultiplier} ${product.baseUnit}`,
            currentStock: product.currentStock,
            projectedStock,
            status: 'Validated' as const,
            entityConfidence: 0.99,
          };
        }
        return e;
      });

      return {
        voice: {
          ...s.voice,
          status: 'REVIEW',
          disambiguation: undefined,
          extractedEntities: updatedEntities,
        },
      };
    });
  },

  confirmAndCommit: () => {
    const { voice, products, addTransaction } = get();
    if (voice.status !== 'REVIEW') return;

    set((s) => ({ voice: { ...s.voice, status: 'EXECUTING' } }));

    voice.extractedEntities.forEach((entity) => {
      if (entity.product && entity.status === 'Validated') {
        const actualDelta =
          entity.intent === 'STOCK_OUT' ? -Math.abs(entity.normalizedDelta) : Math.abs(entity.normalizedDelta);

        addTransaction({
          type: entity.intent,
          productId: entity.product.id,
          productName: entity.product.name,
          delta: actualDelta,
          normalizedUnit: entity.normalizedUnit,
          source: 'Voice',
          note: `"${voice.transcript}"`,
          confirmedBy: 'Suresh R.',
        });
      }
    });

    setTimeout(() => {
      set((s) => ({ voice: { ...s.voice, status: 'COMPLETED' } }));
    }, 400);
  },

  resetVoice: () => set({ voice: INITIAL_VOICE }),

  addTransaction: (tx) =>
    set((s) => {
      const newTx: Transaction = {
        ...tx,
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString(),
      };
      const updatedProducts = s.products.map((p) =>
        p.id === tx.productId ? { ...p, currentStock: p.currentStock + tx.delta } : p
      );
      return { transactions: [newTx, ...s.transactions], products: updatedProducts };
    }),
}));
