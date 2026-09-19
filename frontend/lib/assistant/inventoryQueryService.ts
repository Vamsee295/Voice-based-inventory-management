import { InventoryService } from '../inventory/services/inventoryService';
import { unitService } from '../inventory/units/unitService';
import { SpeechAdapter } from '../voice/speechAdapter';
import { Product } from '../inventory/models/product';
import { ExpiryService } from '../alerts/expiryService';

export class InventoryQueryService {
  constructor(
    private inventoryService: InventoryService,
    private speechAdapter: SpeechAdapter | null
  ) {}

  public async handleQuery(intent: string, product?: Product): Promise<string> {
    let answer = '';

    if (intent === 'STOCK_LOOKUP') {
      if (!product) {
        answer = 'Please specify which product you want to check.';
      } else {
        // Get fresh product data
        const freshProduct = await this.inventoryService.getProductById(product.id);
        if (freshProduct) {
          const formattedUnits = unitService.formatStock(freshProduct);
          answer = `${freshProduct.name} has ${freshProduct.currentStock} ${freshProduct.baseUnit} available. That is approximately ${formattedUnits}.`;
        } else {
          answer = 'I could not find that product.';
        }
      }
    } else if (intent === 'LOW_STOCK_QUERY') {
      const allProducts = await this.inventoryService.getAllProducts();
      const lowStockProducts = allProducts.filter(p => p.currentStock <= p.reorderLevel);
      
      if (lowStockProducts.length === 0) {
        answer = 'All items are currently adequately stocked.';
      } else {
        const names = lowStockProducts.map(p => p.name).join(', ');
        answer = `The following items are low on stock: ${names}.`;
      }
    } else if (intent === 'REORDER_QUERY') {
      const allProducts = await this.inventoryService.getAllProducts();
      const lowStockProducts = allProducts.filter(p => p.currentStock <= p.reorderLevel);
      
      if (lowStockProducts.length === 0) {
        answer = 'No items need to be reordered at the moment.';
      } else {
        const recommendations = lowStockProducts.map(p => {
          // A simple reorder logic: order enough to reach 2x the reorder level, or just the gap
          // The plan says: suggestedReorder = Math.max(product.reorderLevel - product.currentStock, 0)
          const suggestedReorder = Math.max(p.reorderLevel - p.currentStock, 0);
          return `${p.name} needs ${suggestedReorder} ${p.baseUnit}`;
        });
        answer = `You should reorder: ${recommendations.join(', ')}.`;
      }
    } else if (intent === 'STOCK_HISTORY') {
      if (!product) {
        answer = 'Please specify which product you want the history for.';
      } else {
        const txs = await this.inventoryService.getTransactions(product.id, 1);
        if (txs.length > 0) {
           const tx = txs[0];
           answer = `The last transaction for ${product.name} was a ${tx.type.replace('_', ' ').toLowerCase()} of ${tx.quantity} ${tx.unit}.`;
        } else {
           answer = `There are no recent transactions for ${product.name}.`;
        }
      }
    } else if (intent === 'EXPIRY_QUERY') {
      const summary = await ExpiryService.getExpirySummaryForVoice();
      answer = summary.responseText;
    } else {
      answer = 'I am not sure how to answer that.';
    }

    if (this.speechAdapter) {
      this.speechAdapter.speak(answer);
    }
    return answer;
  }
}
