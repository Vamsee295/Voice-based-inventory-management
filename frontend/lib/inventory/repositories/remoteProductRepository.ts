import { Product } from '../models/product';

export class RemoteProductRepository {
  async getAll(): Promise<Product[]> {
    const res = await fetch('/api/inventory');
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    return data.products;
  }

  async getById(id: string): Promise<Product | undefined> {
    const products = await this.getAll();
    return products.find(p => p.id === id);
  }

  async getByBarcode(barcode: string): Promise<Product | undefined> {
    const products = await this.getAll();
    return products.find(p => p.barcode === barcode);
  }

  async save(product: Product): Promise<void> {
    const res = await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error('Failed to save product');
  }

  async update(product: Product): Promise<void> {
    // Usually a PUT /api/inventory/:id, but for now we rely on the Transaction API to update stock
    // If we need to update metadata, we would implement it here.
  }
}
