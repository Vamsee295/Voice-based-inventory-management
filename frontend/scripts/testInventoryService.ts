import { InventoryService } from '../lib/inventory/services/inventoryService';
import { LocalProductRepository } from '../lib/inventory/repositories/productRepository';
import { LocalTransactionRepository } from '../lib/inventory/repositories/transactionRepository';

// Mock localStorage for Node.js test execution
class MockStorage {
  private store: Record<string, string> = {};
  getItem(key: string): string | null {
    return this.store[key] || null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
}

// Attach mock window & localStorage
const mockStorage = new MockStorage();
(global as any).window = {
  localStorage: mockStorage,
};

async function runInventoryTests() {
  console.log('====================================================');
  console.log('VOICEMATE MILESTONE 2: 8 MANDATORY INVENTORY TESTS');
  console.log('====================================================\n');

  // Repositories using the mockStorage
  const prodRepo = new LocalProductRepository();
  const txRepo = new LocalTransactionRepository();
  const service = new InventoryService(prodRepo, txRepo);

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: Create Rice 120 kg -> Expected: 120 kg
    // -------------------------------------------------------------
    console.log('--- TEST 1: Create Rice 120 kg ---');
    const createRes = await service.createProduct({
      name: 'Sona Masoori Rice',
      sku: 'RICE-SM-M2-01',
      category: 'Grains & Pulses',
      openingStock: 120,
      baseUnit: 'kg',
      reorderLevel: 30,
      price: 55,
      unitConversions: {
        Bag: 25, // 1 Bag = 25 kg per product config
      },
    });

    assert(createRes.success, 'Test 1.1: Rice created successfully');
    assert(createRes.data?.currentStock === 120, `Test 1.2: Stock is exactly 120 kg (got ${createRes.data?.currentStock})`);
    assert(createRes.data?.baseUnit === 'kg', 'Test 1.3: Base unit is kg');

    const riceId = createRes.data!.id;

    // Verify opening transaction was recorded
    const txList1 = await service.getTransactions(riceId);
    assert(txList1.length > 0 && txList1[0].type === 'STOCK_IN', 'Test 1.4: Opening transaction created in ledger');

    // -------------------------------------------------------------
    // TEST 2: Stock IN 2 Bags (1 Bag = 25 kg) -> Expected: 170 kg
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Stock IN 2 Bags (1 Bag = 25 kg) ---');
    const inRes = await service.stockIn({
      productId: riceId,
      quantity: 2,
      unit: 'Bag',
      source: 'MANUAL',
      note: 'Supplier delivery of 2 bags',
    });

    assert(inRes.success, 'Test 2.1: Stock IN 2 Bags succeeded');
    assert(inRes.data?.transaction.normalizedQuantity === 50, `Test 2.2: Normalized 2 Bags to 50 kg (got ${inRes.data?.transaction.normalizedQuantity})`);
    assert(inRes.data?.product.currentStock === 170, `Test 2.3: Expected 170 kg stock balance (got ${inRes.data?.product.currentStock})`);
    assert(inRes.data?.transaction.type === 'STOCK_IN', 'Test 2.4: Transaction recorded as STOCK_IN');

    // -------------------------------------------------------------
    // TEST 3: Stock OUT 20 kg -> Expected: 150 kg
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Stock OUT 20 kg ---');
    const outRes = await service.stockOut({
      productId: riceId,
      quantity: 20,
      unit: 'kg',
      source: 'MANUAL',
      note: 'Customer counter sale',
    });

    assert(outRes.success, 'Test 3.1: Stock OUT 20 kg succeeded');
    assert(outRes.data?.product.currentStock === 150, `Test 3.2: Expected 150 kg stock balance (got ${outRes.data?.product.currentStock})`);
    assert(outRes.data?.transaction.type === 'STOCK_OUT', 'Test 3.3: Transaction recorded as STOCK_OUT');

    // -------------------------------------------------------------
    // TEST 4: Stock OUT 200 kg -> Expected: REJECTED, stock remains 150 kg
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Stock OUT 200 kg (Insufficient stock) ---');
    const overOutRes = await service.stockOut({
      productId: riceId,
      quantity: 200,
      unit: 'kg',
      source: 'MANUAL',
    });

    assert(!overOutRes.success, 'Test 4.1: Excessive Stock OUT 200 kg is REJECTED');
    assert(
      Boolean(overOutRes.error?.includes('Insufficient stock') && overOutRes.error?.includes('cannot become negative')),
      `Test 4.2: User-friendly rejection error returned ("${overOutRes.error}")`
    );

    const checkRice = await service.getProductById(riceId);
    assert(checkRice?.currentStock === 150, `Test 4.3: Stock strictly preserved at 150 kg (got ${checkRice?.currentStock})`);

    // -------------------------------------------------------------
    // TEST 5: Sugar 50 packets, Stock OUT 5 packets -> Expected: 45 packets
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Sugar stock flow (50 packets - 5 packets = 45 packets) ---');
    const sugarRes = await service.createProduct({
      name: 'Sugar Medium S-30',
      sku: 'SUGAR-TEST-50',
      category: 'Staples',
      openingStock: 50,
      baseUnit: 'packet',
      reorderLevel: 15,
      price: 42,
    });
    assert(sugarRes.success && sugarRes.data?.currentStock === 50, 'Test 5.1: Sugar created with 50 packets');

    const sugarOut = await service.stockOut({
      productId: sugarRes.data!.id,
      quantity: 5,
      unit: 'packet',
      source: 'MANUAL',
      note: 'Grocery sale',
    });
    assert(sugarOut.success, 'Test 5.2: Stock OUT 5 packets succeeded');
    assert(sugarOut.data?.product.currentStock === 45, `Test 5.3: Current stock is exactly 45 packets (got ${sugarOut.data?.product.currentStock})`);

    // -------------------------------------------------------------
    // TEST 6: Change reorder level -> Verify LOW STOCK state updates
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: Change reorder level & verify LOW STOCK state ---');
    // Rice currentStock is 150 kg, initial reorderLevel is 30 -> currently healthy (150 > 30)
    let riceCurrent = await service.getProductById(riceId);
    assert((riceCurrent?.currentStock || 0) > (riceCurrent?.reorderLevel || 0), 'Test 6.1: Rice is initially healthy (150 > 30)');

    // Raise reorder level to 160 kg -> Rice is now LOW STOCK (150 <= 160)
    const updateReorderHigh = await service.updateProduct(riceId, { reorderLevel: 160 });
    assert(updateReorderHigh.success && updateReorderHigh.data?.reorderLevel === 160, 'Test 6.2: Reorder level changed to 160 kg');
    const isLowStockNow = (updateReorderHigh.data?.currentStock || 0) <= (updateReorderHigh.data?.reorderLevel || 0);
    assert(isLowStockNow, 'Test 6.3: Low stock calculation correctly evaluates to TRUE (150 <= 160)');

    // Lower reorder level back to 50 kg -> Rice is healthy again (150 > 50)
    const updateReorderLow = await service.updateProduct(riceId, { reorderLevel: 50 });
    const isHealthyAgain = (updateReorderLow.data?.currentStock || 0) > (updateReorderLow.data?.reorderLevel || 0);
    assert(isHealthyAgain, 'Test 6.4: Low stock calculation resets to FALSE when reorder lowered to 50 kg');

    // -------------------------------------------------------------
    // TEST 7: Change product price -> Verify stock valuation updates
    // -------------------------------------------------------------
    console.log('\n--- TEST 7: Change product price & verify stock valuation ---');
    // Rice stock is 150 kg. Old price: 55 -> Valuation: 150 * 55 = 8250
    const oldValuation = (updateReorderLow.data?.currentStock || 0) * (updateReorderLow.data?.price || 0);
    assert(oldValuation === 150 * 55, `Test 7.1: Previous valuation is ₹${oldValuation}`);

    // Update price to 60
    const updatePriceRes = await service.updateProduct(riceId, { price: 60 });
    assert(updatePriceRes.success && updatePriceRes.data?.price === 60, 'Test 7.2: Price updated to ₹60/kg');

    const newValuation = (updatePriceRes.data?.currentStock || 0) * (updatePriceRes.data?.price || 0);
    assert(newValuation === 150 * 60, `Test 7.3: Valuation correctly recalculates to ₹${newValuation} (got ${newValuation})`);

    // -------------------------------------------------------------
    // TEST 8: Reload application -> Verify data persists
    // -------------------------------------------------------------
    console.log('\n--- TEST 8: Verify persistence across simulated app reload ---');
    // Simulate app reload by creating completely new repository instances reading from the same storage
    const newProdRepo = new LocalProductRepository();
    const newTxRepo = new LocalTransactionRepository();
    const newService = new InventoryService(newProdRepo, newTxRepo);

    const reloadedRice = await newService.getProductById(riceId);
    assert(Boolean(reloadedRice), 'Test 8.1: Rice loaded from storage on reload');
    assert(reloadedRice?.currentStock === 150, `Test 8.2: Rice stock persisted at 150 kg (got ${reloadedRice?.currentStock})`);
    assert(reloadedRice?.price === 60, `Test 8.3: Rice price persisted at ₹60 (got ${reloadedRice?.price})`);

    const reloadedTransactions = await newService.getTransactions(riceId);
    assert(reloadedTransactions.length >= 3, `Test 8.4: Transaction ledger persisted across reload (${reloadedTransactions.length} txs found)`);

    // -------------------------------------------------------------
    // Additional Test: Physical count adjustment creates ADJUSTMENT transaction
    // -------------------------------------------------------------
    console.log('\n--- Additional Test: Physical audit count adjustment ---');
    const adjustRes = await newService.adjustStock({
      productId: riceId,
      newPhysicalStock: 148,
      note: 'Spillage / audit variance',
    });
    assert(adjustRes.success && adjustRes.data?.product.currentStock === 148, 'Audit test 1: Stock adjusted to 148 kg');
    assert(adjustRes.data?.transaction.type === 'ADJUSTMENT', 'Audit test 2: Transaction type is ADJUSTMENT');
    assert(adjustRes.data?.transaction.previousStock === 150 && adjustRes.data?.transaction.newStock === 148, 'Audit test 3: Previous and new stock recorded accurately');

    // -------------------------------------------------------------
    // Final Summary
    // -------------------------------------------------------------
    console.log('\n====================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Unexpected test error:', err);
    process.exit(1);
  }
}

runInventoryTests();
