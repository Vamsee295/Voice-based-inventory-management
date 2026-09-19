export interface DemoEntity {
  id: string;
  product: string;
  sku: string;
  quantity: number;
  unit: string;
  normalized: string;
  currentStock: string;
  projectedStock: string;
  status: 'Validated' | 'Requires Clarification' | 'Flagged';
  deltaValue: number;
  deltaDisplay: string;
  unitConversionNote?: string;
}

export interface DemoSession {
  id: string;
  tag: string;
  category: string;
  phrase: string;
  language: string;
  confidence: number;
  intent: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';
  intentLabel: string;
  understoodProduct: string;
  understoodQuantity: number;
  understoodUnit: string;
  resolvedSkuName: string;
  entities: DemoEntity[];
  transactionPreview: {
    operation: string;
    product: string;
    quantity: string;
    current: string;
    after: string;
    source: string;
    status: string;
  };
  hasDisambiguation?: boolean;
  disambiguationOptions?: Array<{
    id: string;
    name: string;
    sku: string;
    currentStock: string;
    location: string;
  }>;
}

export const DEMO_SESSIONS: Record<string, DemoSession> = {
  test_1: {
    id: 'test_1', tag: 'T1: TELUGU IN', category: 'Test', phrase: 'Rice rendu bags vachayi',
    language: 'Telugu + Indian English', confidence: 0.98, intent: 'STOCK_IN', intentLabel: 'STOCK IN', understoodProduct: 'Rice', understoodQuantity: 2, understoodUnit: 'Bags', resolvedSkuName: 'Sona Masoori Rice', entities: [], transactionPreview: { operation: 'STOCK IN', product: 'Rice', quantity: '+2 Bags', current: '...', after: '...', source: 'Voice Console', status: 'Ready for confirmation' }
  },
  test_2: {
    id: 'test_2', tag: 'T2: TELUGU OUT', category: 'Test', phrase: 'Sugar aidu packets ammamu',
    language: 'Telugu + Indian English', confidence: 0.96, intent: 'STOCK_OUT', intentLabel: 'STOCK OUT', understoodProduct: 'Sugar', understoodQuantity: 5, understoodUnit: 'Packets', resolvedSkuName: 'Sugar Medium S-30', entities: [], transactionPreview: { operation: 'STOCK OUT', product: 'Sugar', quantity: '-5 Packets', current: '...', after: '...', source: 'Voice Console', status: 'Ready for confirmation' }
  },
  test_3: {
    id: 'test_3', tag: 'T3: STOCK QUERY', category: 'Test', phrase: 'Rice entha undi?',
    language: 'Telugu + Indian English', confidence: 0.97, intent: 'STOCK_IN', intentLabel: 'STOCK LOOKUP', understoodProduct: 'Rice', understoodQuantity: 0, understoodUnit: '', resolvedSkuName: 'Sona Masoori Rice', entities: [], transactionPreview: { operation: 'QUERY', product: 'Rice', quantity: 'N/A', current: 'N/A', after: 'N/A', source: 'Voice Assistant', status: '...' }
  },
  test_4: {
    id: 'test_4', tag: 'T4: LOW STOCK', category: 'Test', phrase: 'Which items are low?',
    language: 'English', confidence: 0.99, intent: 'STOCK_IN', intentLabel: 'LOW STOCK QUERY', understoodProduct: 'All', understoodQuantity: 0, understoodUnit: '', resolvedSkuName: '', entities: [], transactionPreview: { operation: 'QUERY', product: 'Inventory', quantity: 'N/A', current: 'N/A', after: 'N/A', source: 'Voice Assistant', status: '...' }
  },
  test_5: {
    id: 'test_5', tag: 'T5: VERNACULAR LOW', category: 'Test', phrase: 'Salt thakkuva unda?',
    language: 'Telugu + English', confidence: 0.95, intent: 'STOCK_IN', intentLabel: 'LOW STOCK QUERY', understoodProduct: 'Salt', understoodQuantity: 0, understoodUnit: '', resolvedSkuName: 'Tata Salt Crystal', entities: [], transactionPreview: { operation: 'QUERY', product: 'Salt', quantity: 'N/A', current: 'N/A', after: 'N/A', source: 'Voice Assistant', status: '...' }
  },
  test_6: {
    id: 'test_6', tag: 'T6: ENGLISH IN', category: 'Test', phrase: 'Add 3 bags of rice',
    language: 'English', confidence: 0.98, intent: 'STOCK_IN', intentLabel: 'STOCK IN', understoodProduct: 'Rice', understoodQuantity: 3, understoodUnit: 'bags', resolvedSkuName: 'Sona Masoori Rice', entities: [], transactionPreview: { operation: 'STOCK IN', product: 'Rice', quantity: '+3 bags', current: '...', after: '...', source: 'Voice Console', status: 'Ready for confirmation' }
  },
  test_7: {
    id: 'test_7', tag: 'T7: OVERDRAFT', category: 'Test', phrase: 'Remove 200 kg rice',
    language: 'English', confidence: 0.97, intent: 'STOCK_OUT', intentLabel: 'STOCK OUT', understoodProduct: 'Rice', understoodQuantity: 200, understoodUnit: 'kg', resolvedSkuName: 'Sona Masoori Rice', entities: [], transactionPreview: { operation: 'STOCK OUT', product: 'Rice', quantity: '-200 kg', current: '...', after: '...', source: 'Voice Console', status: 'INSUFFICIENT_STOCK' }
  },
  test_8: {
    id: 'test_8', tag: 'T8: MISSING QTY', category: 'Test', phrase: 'Add rice',
    language: 'English', confidence: 0.94, intent: 'STOCK_IN', intentLabel: 'STOCK IN', understoodProduct: 'Rice', understoodQuantity: 0, understoodUnit: '', resolvedSkuName: 'Sona Masoori Rice', entities: [], transactionPreview: { operation: 'ERROR', product: 'Rice', quantity: 'N/A', current: 'N/A', after: 'N/A', source: 'Voice Console', status: 'MISSING_QUANTITY' }
  }
};

export const DEMO_TRANSACTIONS = [
  {
    id: 'tx-101',
    time: '01:58 PM',
    type: 'STOCK_IN',
    typeLabel: 'INWARD',
    source: 'Voice',
    productName: 'Sona Masoori Rice',
    delta: '+50 kg',
    isPositive: true,
    note: '"Rice rendu bags vachayi"',
    confirmedBy: 'Suresh R.',
  },
  {
    id: 'tx-102',
    time: '02:36 PM',
    type: 'STOCK_OUT',
    typeLabel: 'SALE',
    source: 'Voice',
    productName: 'Sugar Medium S-30',
    delta: '-5 kg',
    isPositive: false,
    note: '"5 packets chekkera ammamu"',
    confirmedBy: 'Suresh R.',
  },
  {
    id: 'tx-103',
    time: '02:47 PM',
    type: 'ADJUSTMENT',
    typeLabel: 'ADJUSTMENT',
    source: 'Manual',
    productName: 'Freedom Sunflower Oil',
    delta: '-2 L',
    isPositive: false,
    note: 'Stock audit check / spillage write-off',
    confirmedBy: 'Suresh R.',
  },
  {
    id: 'tx-104',
    time: '03:15 PM',
    type: 'STOCK_IN',
    typeLabel: 'INWARD',
    source: 'Voice',
    productName: 'Aashirvaad Superior MP Atta',
    delta: '+100 kg',
    isPositive: true,
    note: '"Atta rendu katte vachayi"',
    confirmedBy: 'Suresh R.',
  },
];

export const DEMO_TRADE_UNITS = [
  { unit: 'Bag', vernacular: 'బస్తా (Basta)', value: '25 kg', note: 'Andhra standard' },
  { unit: 'Katta', vernacular: 'కట్టా (Katta)', value: '50 kg', note: 'Telangana standard' },
  { unit: 'Tin / Dabba', vernacular: 'డబ్బా (Dabba)', value: '15 L', note: 'Edible oil standard' },
  { unit: 'Quintal', vernacular: 'క్వింటాల్', value: '100 kg', note: 'Bulk produce' },
  { unit: 'Dozen', vernacular: 'డజన్', value: '12 pcs', note: 'FMCG standard' },
  { unit: 'Packet', vernacular: 'ప్యాకెట్', value: 'Business config.', note: 'Configurable' },
  { unit: 'Bottle', vernacular: 'బాటిల్', value: 'Business config.', note: 'Configurable' },
  { unit: 'Box', vernacular: 'పెట్టె (Pette)', value: 'Business config.', note: 'Configurable' },
];

export const DEMO_ATTENTION_ITEMS = [
  {
    id: 'att-1',
    name: 'Tata Salt Crystal 1kg',
    type: 'LOW_STOCK',
    current: '14 pcs',
    threshold: '25 pcs',
    actionText: 'Reorder Stock',
  },
  {
    id: 'att-2',
    name: 'Amul Butter 500g (Batch #942)',
    type: 'EXPIRY',
    current: 'Expires in 3 days',
    threshold: 'Shelf Life Alert',
    actionText: 'Discount / Move',
  },
];
