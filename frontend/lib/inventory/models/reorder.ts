export type ReorderStatus = 'PENDING' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';

export interface ReorderRecord {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unit: string;
  priority: 'CRITICAL' | 'LOW';
  status: ReorderStatus;
  createdAt: string;
  createdBy: string;
}

export interface CreateReorderDTO {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unit: string;
  priority: 'CRITICAL' | 'LOW';
  createdBy?: string;
}
