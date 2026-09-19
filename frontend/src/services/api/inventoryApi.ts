import { apiClient } from './client';
import { InventoryTransaction } from '../../../lib/inventory/models/transaction';

export const inventoryApi = {
  adjustStock: (data: {
    product_id: string;
    quantity: number;
    source: string;
    operation_id?: string;
  }) => {
    return apiClient.post<InventoryTransaction>('/inventory/transactions', data);
  }
};
