import { Product } from '../inventory/models/product';
import { CreateReorderDTO, ReorderRecord } from '../inventory/models/reorder';
import { reorderRepository } from '../inventory/repositories/reorderRepository';

export class ReorderService {
  static getSuggestedReorderQuantity(product: Product): number {
    return Math.max(product.reorderLevel - product.currentStock, 0);
  }

  static async createReorder(dto: CreateReorderDTO): Promise<ReorderRecord> {
    if (dto.quantity <= 0) {
      throw new Error('Reorder quantity must be greater than zero.');
    }

    const timestamp = new Date();
    const dateStr = timestamp.toISOString().split('T')[0].replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const id = `RO-${dateStr}-${randomNum}`;

    const record: ReorderRecord = {
      id,
      productId: dto.productId,
      productName: dto.productName,
      productSku: dto.productSku,
      quantity: dto.quantity,
      unit: dto.unit,
      priority: dto.priority,
      status: 'PENDING',
      createdAt: timestamp.toISOString(),
      createdBy: dto.createdBy || 'System',
    };

    return await reorderRepository.save(record);
  }
}
