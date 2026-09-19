import { CreateProductDTO, Product, UpdateProductDTO } from '../models/product';
import { InventoryTransaction, TransactionSource, TransactionType } from '../models/transaction';
import { IProductRepository, LocalProductRepository } from '../repositories/productRepository';
import { ITransactionRepository, LocalTransactionRepository } from '../repositories/transactionRepository';
import { unitService } from '../units/unitService';
import { syncService } from '../../offline/syncService';

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class InventoryService {
  constructor(
    private prodRepo: IProductRepository = new LocalProductRepository(),
    private txRepo: ITransactionRepository = new LocalTransactionRepository()
  ) {}

  /**
   * Create a new product with business validation
   */
  public async createProduct(dto: CreateProductDTO): Promise<ServiceResult<Product>> {
    try {
      // 1. Validate name
      if (!dto.name || dto.name.trim().length === 0) {
        return { success: false, error: 'Product name cannot be empty.' };
      }

      // 2. Validate SKU
      if (!dto.sku || dto.sku.trim().length === 0) {
        return { success: false, error: 'SKU cannot be empty.' };
      }
      const existingSku = await this.prodRepo.getBySku(dto.sku);
      if (existingSku) {
        return { success: false, error: `SKU "${dto.sku}" already exists. SKU must be unique.` };
      }

      // 3. Validate base unit
      if (!dto.baseUnit || !unitService.isUnitSupported(dto.baseUnit)) {
        return { success: false, error: `Base unit "${dto.baseUnit}" is not supported.` };
      }

      // 4. Validate numbers
      if (dto.openingStock < 0) {
        return { success: false, error: 'Opening stock cannot be negative.' };
      }
      if (dto.price < 0) {
        return { success: false, error: 'Price cannot be negative.' };
      }
      if (dto.reorderLevel < 0) {
        return { success: false, error: 'Reorder level cannot be negative.' };
      }

      const id = `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const now = new Date().toISOString();

      const product: Product = {
        id,
        name: dto.name.trim(),
        sku: dto.sku.trim().toUpperCase(),
        category: dto.category.trim() || 'General',
        barcode: dto.barcode?.trim(),
        currentStock: dto.openingStock,
        baseUnit: dto.baseUnit.trim().toLowerCase(),
        reorderLevel: dto.reorderLevel,
        price: dto.price,
        expiryDate: dto.expiryDate || null,
        unitConversions: dto.unitConversions || {},
        createdAt: now,
        updatedAt: now,
      };

      const savedProduct = await this.prodRepo.save(product);

      // Record opening transaction if opening stock > 0
      if (dto.openingStock > 0) {
        const tx: InventoryTransaction = {
          id: `tx-open-${Date.now()}`,
          productId: savedProduct.id,
          productName: savedProduct.name,
          productSku: savedProduct.sku,
          type: 'STOCK_IN',
          quantity: dto.openingStock,
          unit: savedProduct.baseUnit,
          normalizedQuantity: dto.openingStock,
          normalizedUnit: savedProduct.baseUnit,
          source: 'MANUAL',
          note: 'Opening balance setup',
          previousStock: 0,
          newStock: dto.openingStock,
          createdAt: now,
          createdBy: 'Suresh R.',
        };
        await this.txRepo.save(tx);
      }

      return { success: true, data: savedProduct };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to create product.' };
    }
  }

  /**
   * Update an existing product
   */
  public async updateProduct(id: string, dto: UpdateProductDTO): Promise<ServiceResult<Product>> {
    try {
      const product = await this.prodRepo.getById(id);
      if (!product) {
        return { success: false, error: `Product with ID "${id}" not found.` };
      }

      // If SKU is being updated, verify uniqueness
      if (dto.sku && dto.sku.trim().toUpperCase() !== product.sku) {
        const existingSku = await this.prodRepo.getBySku(dto.sku);
        if (existingSku && existingSku.id !== id) {
          return { success: false, error: `SKU "${dto.sku}" already exists.` };
        }
      }

      if (dto.price !== undefined && dto.price < 0) {
        return { success: false, error: 'Price cannot be negative.' };
      }
      if (dto.reorderLevel !== undefined && dto.reorderLevel < 0) {
        return { success: false, error: 'Reorder level cannot be negative.' };
      }

      const updates: Partial<Product> = {
        ...dto,
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.sku ? { sku: dto.sku.trim().toUpperCase() } : {}),
        ...(dto.barcode !== undefined ? { barcode: dto.barcode.trim() } : {}),
      };

      const updated = await this.prodRepo.update(id, updates);
      return { success: true, data: updated };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update product.' };
    }
  }

  /**
   * Add incoming stock (STOCK_IN)
   */
  public async stockIn(params: {
    productId: string;
    quantity: number;
    unit: string;
    source?: TransactionSource;
    note?: string;
    createdBy?: string;
    idempotencyKey?: string;
  }): Promise<ServiceResult<{ product: Product; transaction: InventoryTransaction }>> {
    try {
      const res = await fetch('/api/inventory/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: params.productId,
          intent: 'STOCK_IN',
          quantity: params.quantity,
          unit: params.unit,
          source: params.source || 'MANUAL',
          reference: params.note,
          idempotencyKey: params.idempotencyKey || `VOICE-${Date.now()}`
        })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to process Stock In.' };
      }

      return { success: true, data: { product: data.product, transaction: data.transaction } };
    } catch (err: any) {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        syncService.enqueue('/api/inventory/transactions', 'POST', {
          productId: params.productId,
          intent: 'STOCK_IN',
          quantity: params.quantity,
          unit: params.unit,
          source: params.source || 'MANUAL',
          reference: params.note,
          idempotencyKey: params.idempotencyKey || `VOICE-${Date.now()}`
        });
        return { success: true, data: {} as any }; // Optimistic return for UI
      }
      return { success: false, error: err.message || 'Failed to process Stock In (Network Error).' };
    }
  }

  /**
   * Remove outgoing stock (STOCK_OUT).
   * Strict validation: Rejects if result would be negative!
   */
  public async stockOut(params: {
    productId: string;
    quantity: number;
    unit: string;
    source?: TransactionSource;
    note?: string;
    createdBy?: string;
    idempotencyKey?: string;
  }): Promise<ServiceResult<{ product: Product; transaction: InventoryTransaction }>> {
    try {
      const res = await fetch('/api/inventory/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: params.productId,
          intent: 'STOCK_OUT',
          quantity: params.quantity,
          unit: params.unit,
          source: params.source || 'MANUAL',
          reference: params.note,
          idempotencyKey: params.idempotencyKey || `VOICE-${Date.now()}`
        })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to process Stock Out.' };
      }

      return { success: true, data: { product: data.product, transaction: data.transaction } };
    } catch (err: any) {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        syncService.enqueue('/api/inventory/transactions', 'POST', {
          productId: params.productId,
          intent: 'STOCK_OUT',
          quantity: params.quantity,
          unit: params.unit,
          source: params.source || 'MANUAL',
          reference: params.note,
          idempotencyKey: params.idempotencyKey || `VOICE-${Date.now()}`
        });
        return { success: true, data: {} as any }; // Optimistic return for UI
      }
      return { success: false, error: err.message || 'Failed to process Stock Out (Network Error).' };
    }
  }

  /**
   * Adjust inventory stock based on physical verification count
   */
  public async adjustStock(params: {
    productId: string;
    newPhysicalStock: number;
    unit?: string;
    source?: TransactionSource;
    note?: string;
    createdBy?: string;
  }): Promise<ServiceResult<{ product: Product; transaction: InventoryTransaction }>> {
    try {
      if (params.newPhysicalStock < 0) {
        return { success: false, error: 'Physical stock count cannot be negative.' };
      }

      const product = await this.prodRepo.getById(params.productId);
      if (!product) {
        return { success: false, error: `Product with ID "${params.productId}" not found.` };
      }

      const previousStock = product.currentStock;
      const targetStock = Number(params.newPhysicalStock.toFixed(3));
      const delta = Number((targetStock - previousStock).toFixed(3));

      // Update product stock
      const updatedProduct = await this.prodRepo.update(product.id, { currentStock: targetStock });

      // Record ADJUSTMENT transaction
      const tx: InventoryTransaction = {
        id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        type: 'ADJUSTMENT',
        quantity: Math.abs(delta),
        unit: product.baseUnit,
        normalizedQuantity: Math.abs(delta),
        normalizedUnit: product.baseUnit,
        source: params.source || 'MANUAL',
        note: params.note || `Physical audit adjustment (Delta: ${delta >= 0 ? '+' : ''}${delta} ${product.baseUnit})`,
        previousStock,
        newStock: targetStock,
        createdAt: new Date().toISOString(),
        createdBy: params.createdBy || 'Suresh R.',
      };

      const savedTx = await this.txRepo.save(tx);
      return { success: true, data: { product: updatedProduct, transaction: savedTx } };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to adjust stock.' };
    }
  }

  /**
   * Configure a custom unit conversion on a product
   */
  public async configureUnitConversion(
    productId: string,
    unit: string,
    multiplierInBaseUnit: number
  ): Promise<ServiceResult<Product>> {
    try {
      if (multiplierInBaseUnit <= 0) {
        return { success: false, error: 'Conversion multiplier must be greater than zero.' };
      }
      const product = await this.prodRepo.getById(productId);
      if (!product) {
        return { success: false, error: 'Product not found.' };
      }

      const conversions = { ...(product.unitConversions || {}), [unit]: multiplierInBaseUnit };
      const updated = await this.prodRepo.update(productId, { unitConversions: conversions });
      return { success: true, data: updated };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to configure unit conversion.' };
    }
  }

  /**
   * Query products with search and category filtering
   */
  public async searchProducts(query: string = '', category: string = ''): Promise<Product[]> {
    const products = await this.prodRepo.getAll();
    const q = query.trim().toLowerCase();
    const cat = category.trim().toLowerCase();

    return products.filter((p) => {
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      const matchesCategory = !cat || cat === 'all' || p.category.toLowerCase() === cat;
      return matchesQuery && matchesCategory;
    });
  }

  public async getProductById(id: string): Promise<Product | null> {
    return this.prodRepo.getById(id);
  }

  public async getAllProducts(): Promise<Product[]> {
    return this.prodRepo.getAll();
  }

  public async getTransactions(productId?: string, limit: number = 20): Promise<InventoryTransaction[]> {
    if (productId) {
      return this.txRepo.getByProductId(productId);
    }
    return this.txRepo.getRecent(limit);
  }
}

export const inventoryService = new InventoryService();
