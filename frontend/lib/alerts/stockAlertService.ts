import { Product } from '../inventory/models/product';

export type AlertPriority = 'CRITICAL' | 'LOW' | 'NORMAL';

export class StockAlertService {
  static getPriority(product: Product): AlertPriority {
    if (product.currentStock <= 0.5 * product.reorderLevel) {
      return 'CRITICAL';
    }
    if (product.currentStock <= product.reorderLevel) {
      return 'LOW';
    }
    return 'NORMAL';
  }
}
