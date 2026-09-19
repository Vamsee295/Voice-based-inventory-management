import { apiClient } from './client';
import { InventoryTransaction } from '../../../lib/inventory/models/transaction';

export const transactionsApi = {
  getAll: () => {
    return apiClient.get<InventoryTransaction[]>('/transactions');
  }
};
