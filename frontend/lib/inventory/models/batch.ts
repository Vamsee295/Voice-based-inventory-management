export type ExpiryStatus = 'EXPIRED' | 'EXPIRING_TODAY' | 'EXPIRING_SOON' | 'UPCOMING' | 'SAFE';

export interface InventoryBatch {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unit: string;
  receivedDate: string;
  expiryDate: string;
  needsAttention: boolean;
  batchNumber?: string;
  sourceDocument?: string;
}
