export type TransactionType = 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';

export type TransactionSource = 'VOICE' | 'MANUAL' | 'BARCODE' | 'INVOICE' | 'CHALLAN';

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  type: TransactionType;
  quantity: number;
  unit: string;
  normalizedQuantity: number;
  normalizedUnit: string;
  source: TransactionSource;
  note?: string;
  previousStock: number;
  newStock: number;
  createdAt: string;
  createdBy: string;
}

export interface CreateTransactionDTO {
  productId: string;
  type: TransactionType;
  quantity: number;
  unit: string;
  source?: TransactionSource;
  note?: string;
  createdBy?: string;
}
