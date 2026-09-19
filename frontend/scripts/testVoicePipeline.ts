import { IntentParser } from '../lib/voice/intentParser';
import { INITIAL_PRODUCTS } from '../lib/inventory/seed/seedData';
import { StockAlertService } from '../lib/alerts/stockAlertService';
import { ReorderService } from '../lib/alerts/reorderService';

async function runTests() {
  console.log('--- Voice Pipeline Automated Tests ---\n');
  
  const products = INITIAL_PRODUCTS;

  const scenarios = [
    { phrase: 'Add 3 bags of rice', expect: 'STOCK_IN', prod: 'Sona Masoori Rice' },
    { phrase: 'Remove 5 packets of sugar', expect: 'STOCK_OUT', prod: 'Sugar Medium S-30' },
    { phrase: 'Rice rendu bags vachayi', expect: 'STOCK_IN', prod: 'Sona Masoori Rice' },
    { phrase: 'Sugar aidu packets ammamu', expect: 'STOCK_OUT', prod: 'Sugar Medium S-30' },
    { phrase: 'Rice entha undi?', expect: 'STOCK_LOOKUP', prod: 'Sona Masoori Rice' },
    { phrase: 'How much rice is available?', expect: 'STOCK_LOOKUP', prod: 'Sona Masoori Rice' },
    { phrase: 'Which items are low?', expect: 'LOW_STOCK_QUERY', prod: undefined },
    { phrase: 'Salt thakkuva unda?', expect: 'LOW_STOCK_QUERY', prod: 'Tata Salt Crystal' },
    { phrase: 'Remove 200 kg rice', expect: 'STOCK_OUT', prod: 'Sona Masoori Rice' },
    { phrase: 'Add rice', expect: 'STOCK_IN', error: 'MISSING_QUANTITY' },
  ];

  let passed = 0;

  for (const s of scenarios) {
    const result = IntentParser.parse(s.phrase, products);
    const intentMatch = result.intent === s.expect;
    const prodMatch = s.prod ? result.product?.name === s.prod : true;
    const errorMatch = s.error ? result.error === s.error : true;

    if (intentMatch && prodMatch && errorMatch) {
      console.log(`✅ PASS: "${s.phrase}" -> Intent: ${result.intent}`);
      passed++;
    } else {
      console.error(`❌ FAIL: "${s.phrase}"`);
      console.error(`   Expected: Intent=${s.expect}, Product=${s.prod}, Error=${s.error}`);
      console.error(`   Got: Intent=${result.intent}, Product=${result.product?.name}, Error=${result.error}`);
    }
  }
  
  console.log('\n--- Priority Alert Test ---');
  const salt = products.find(p => p.sku === 'SALT-TATA-01');
  if (salt) {
     salt.currentStock = 7; // <= 0.5 * 15 (7.5) -> CRITICAL
     const priority = StockAlertService.getPriority(salt);
     const reorderQty = ReorderService.getSuggestedReorderQuantity(salt);
     
     if (priority === 'CRITICAL' && reorderQty === 8) {
        console.log(`✅ PASS: Salt at stock 7 has CRITICAL priority and suggests reorder 8`);
        passed++;
     } else {
        console.error(`❌ FAIL: Priority or reorder mismatch for Salt. Priority=${priority}, Reorder=${reorderQty}`);
     }
  }

  console.log(`\nTests completed: ${passed}/${scenarios.length + 1} passed.`);
  if (passed !== scenarios.length + 1) {
     process.exit(1);
  }
}

runTests();
