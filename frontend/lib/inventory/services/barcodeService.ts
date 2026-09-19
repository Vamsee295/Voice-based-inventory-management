import { Product } from '../models/product';
import { InventoryTransaction } from '../models/transaction';
import { ReorderRecord } from '../models/reorder';
import { InventoryBatch } from '../models/batch';
import { inventoryService, ServiceResult } from './inventoryService';
import { reorderRepository } from '../repositories/reorderRepository';
import { IBatchRepository } from '../repositories/batchRepository';
import { LocalBatchRepository } from '../repositories/batchRepository';

// Using local batch repo directly for now as it's not exported as a singleton instance like others
const batchRepository = new LocalBatchRepository();

export type ScanOperationType = 'STOCK_IN' | 'STOCK_OUT' | 'PO_RECEIVE' | 'AUDIT_COUNT';

export interface ScanOperationParams {
  productId: string;
  operationType: ScanOperationType;
  quantity: number;
  unit: string;
  batchNumber?: string;
  expiryDate?: string;
  linkedPoId?: string;
  createdBy?: string;
}

export interface ScanOperationResult {
  success: boolean;
  product?: Product;
  transaction?: InventoryTransaction;
  batch?: InventoryBatch;
  reorder?: ReorderRecord;
  error?: string;
}

export class BarcodeService {
  /**
   * Resolves a scanned barcode or SKU to a Product
   */
  public async resolveBarcode(scannedCode: string): Promise<Product | null> {
    const code = scannedCode.trim().toLowerCase();
    if (!code) return null;

    const products = await inventoryService.getAllProducts();

    // 1. Match exact barcode
    let matched = products.find(p => p.barcode === code);
    if (matched) return matched;

    // 2. Match exact SKU
    matched = products.find(p => p.sku.toLowerCase() === code);
    if (matched) return matched;

    // 3. Fallback: fuzzy match on SKU or barcode
    matched = products.find(p => 
      p.sku.toLowerCase().includes(code) || 
      (p.barcode && p.barcode.includes(code))
    );

    return matched || null;
  }

  /**
   * Fetch all pending purchase orders / reorders
   */
  public async getPendingPurchaseOrders(): Promise<ReorderRecord[]> {
    const allReorders = await reorderRepository.getAll();
    return allReorders.filter(r => r.status === 'PENDING' || r.status === 'ORDERED');
  }

  /**
   * Process a confirmed scan operation
   */
  public async commitScanOperation(params: ScanOperationParams): Promise<ScanOperationResult> {
    try {
      if (params.quantity <= 0) {
        return { success: false, error: 'Quantity must be greater than zero.' };
      }

      const product = await inventoryService.getProductById(params.productId);
      if (!product) {
        return { success: false, error: 'Product not found.' };
      }

      let txResult: ServiceResult<{ product: Product; transaction: InventoryTransaction }>;
      let batchResult: InventoryBatch | undefined;
      let poResult: ReorderRecord | undefined;

      const operator = params.createdBy || 'Suresh R.';

      // 1. Process Inventory Mutation
      if (params.operationType === 'STOCK_IN') {
        txResult = await inventoryService.stockIn({
          productId: params.productId,
          quantity: params.quantity,
          unit: params.unit,
          source: 'BARCODE',
          createdBy: operator,
        });
      } else if (params.operationType === 'STOCK_OUT') {
        txResult = await inventoryService.stockOut({
          productId: params.productId,
          quantity: params.quantity,
          unit: params.unit,
          source: 'BARCODE',
          createdBy: operator,
        });
      } else if (params.operationType === 'PO_RECEIVE') {
        txResult = await inventoryService.stockIn({
          productId: params.productId,
          quantity: params.quantity,
          unit: params.unit,
          source: 'BARCODE',
          note: `Received against PO: ${params.linkedPoId}`,
          createdBy: operator,
        });
      } else if (params.operationType === 'AUDIT_COUNT') {
        txResult = await inventoryService.adjustStock({
          productId: params.productId,
          newPhysicalStock: params.quantity, // for audit, quantity is the new absolute physical stock! 
          unit: params.unit,
          source: 'BARCODE',
          createdBy: operator,
        });
      } else {
        return { success: false, error: 'Invalid operation type.' };
      }

      if (!txResult.success || !txResult.data) {
        return { success: false, error: txResult.error || 'Failed to process inventory update.' };
      }

      // 2. Handle Batches for incoming goods
      if ((params.operationType === 'STOCK_IN' || params.operationType === 'PO_RECEIVE') && params.batchNumber) {
        const batch: InventoryBatch = {
          id: `${params.batchNumber}-${Date.now()}`,
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          quantity: txResult.data.transaction.normalizedQuantity,
          unit: txResult.data.transaction.normalizedUnit,
          receivedDate: new Date().toISOString(),
          expiryDate: params.expiryDate || '2099-12-31', // Default future expiry if not provided
          needsAttention: false,
          batchNumber: params.batchNumber,
          sourceDocument: params.linkedPoId ? `PO ${params.linkedPoId}` : 'BARCODE SCAN'
        };
        batchResult = await batchRepository.save(batch);
      }

      // 3. Handle PO Fulfillment
      if (params.operationType === 'PO_RECEIVE' && params.linkedPoId) {
        try {
          poResult = await reorderRepository.update(params.linkedPoId, { status: 'RECEIVED' });
        } catch (e: any) {
          console.warn('Failed to update PO status:', e);
        }
      }

      return {
        success: true,
        product: txResult.data.product,
        transaction: txResult.data.transaction,
        batch: batchResult,
        reorder: poResult
      };

    } catch (e: any) {
      return { success: false, error: e.message || 'An unexpected error occurred during scan commit.' };
    }
  }
}

export const barcodeService = new BarcodeService();
