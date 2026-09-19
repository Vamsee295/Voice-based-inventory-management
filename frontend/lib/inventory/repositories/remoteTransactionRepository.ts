import { InventoryTransaction } from '../models/transaction';

export class RemoteTransactionRepository {
  async getAll(): Promise<InventoryTransaction[]> {
    const res = await fetch('/api/transactions');
    if (!res.ok) throw new Error('Failed to fetch transactions');
    const data = await res.json();
    return data.transactions;
  }

  async getRecent(limit: number = 50): Promise<InventoryTransaction[]> {
    const res = await fetch(`/api/transactions?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    const data = await res.json();
    return data.transactions;
  }

  async getForProduct(productId: string, limit?: number): Promise<InventoryTransaction[]> {
    const res = await fetch(`/api/transactions?productId=${productId}${limit ? `&limit=${limit}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch product transactions');
    const data = await res.json();
    return data.transactions;
  }

  async save(transaction: InventoryTransaction): Promise<void> {
    // Save is handled through the Inventory API transaction commit
  }
}
