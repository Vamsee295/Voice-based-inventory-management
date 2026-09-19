import { InventoryService } from '../inventory/services/inventoryService';
import { unitService } from '../inventory/units/unitService';
import { SpeechAdapter } from '../voice/speechAdapter';
import { IntentParser } from '../voice/intentParser';
import { ExpiryService } from '../alerts/expiryService';

export interface ConversationalResponse {
  text: string;
  widgetType?: 'STOCK' | 'LOW_STOCK' | 'REORDER' | 'TRANSACTIONS' | 'EXPIRY' | 'SUPPLIER';
  dataPayload?: any;
}

export class ConversationalService {
  constructor(
    private inventoryService: InventoryService,
    private speechAdapter: SpeechAdapter | null
  ) {}

  public async handleQuery(transcript: string): Promise<ConversationalResponse> {
    const products = await this.inventoryService.getAllProducts();
    const parseResult = IntentParser.parse(transcript, products);
    
    let answer = '';
    let widgetType: ConversationalResponse['widgetType'];
    let dataPayload: any;

    if (parseResult.intent === 'STOCK_LOOKUP') {
      if (!parseResult.product) {
        answer = 'Please specify which product you want to check.';
      } else {
        const freshProduct = await this.inventoryService.getProductById(parseResult.product.id);
        if (freshProduct) {
          const formattedUnits = unitService.formatStock(freshProduct);
          answer = `${freshProduct.name} has ${freshProduct.currentStock} ${freshProduct.baseUnit} available. That is approximately ${formattedUnits}.`;
          widgetType = 'STOCK';
          dataPayload = { product: freshProduct };
        } else {
          answer = 'I could not find that product.';
        }
      }
    } else if (parseResult.intent === 'LOW_STOCK_QUERY') {
      const lowStockProducts = products.filter(p => p.currentStock <= p.reorderLevel);
      if (lowStockProducts.length === 0) {
        answer = 'All items are currently adequately stocked.';
      } else {
        const names = lowStockProducts.map(p => p.name).join(', ');
        answer = `The following items are low on stock: ${names}.`;
        widgetType = 'LOW_STOCK';
        dataPayload = { products: lowStockProducts };
      }
    } else if (parseResult.intent === 'REORDER_QUERY') {
      const lowStockProducts = products.filter(p => p.currentStock <= p.reorderLevel);
      if (lowStockProducts.length === 0) {
        answer = 'No items need to be reordered at the moment.';
      } else {
        const recommendations = lowStockProducts.map(p => {
          const suggestedReorder = Math.max(p.reorderLevel - p.currentStock, 0);
          return `${p.name} needs ${suggestedReorder} ${p.baseUnit}`;
        });
        answer = `You should reorder: ${recommendations.join(', ')}.`;
        widgetType = 'REORDER';
        dataPayload = { products: lowStockProducts };
      }
    } else if (parseResult.intent === 'STOCK_HISTORY') {
      if (!parseResult.product) {
        answer = 'Please specify which product you want the history for.';
      } else {
        const txs = await this.inventoryService.getTransactions(parseResult.product.id, 5);
        if (txs.length > 0) {
           const tx = txs[0];
           answer = `The last transaction for ${parseResult.product.name} was a ${tx.type.replace('_', ' ').toLowerCase()} of ${tx.quantity} ${tx.unit} from ${tx.source}.`;
           widgetType = 'TRANSACTIONS';
           dataPayload = { transactions: txs, product: parseResult.product };
        } else {
           answer = `There are no recent transactions for ${parseResult.product.name}.`;
        }
      }
    } else if (parseResult.intent === 'EXPIRY_QUERY') {
      const summary = await ExpiryService.getExpirySummaryForVoice();
      answer = summary.responseText;
      widgetType = 'EXPIRY';
      dataPayload = { summary };
    } else if (parseResult.intent === 'TRANSACTION_HISTORY_QUERY') {
      // Just fetch recent transactions for all products
      const txs = await this.inventoryService.getTransactions();
      const today = new Date().toDateString();
      const todaysTxs = txs.filter(tx => new Date(tx.createdAt).toDateString() === today);
      
      if (todaysTxs.length > 0) {
        answer = `There have been ${todaysTxs.length} stock movements today.`;
      } else {
        answer = `There have been no stock movements today.`;
      }
      widgetType = 'TRANSACTIONS';
      dataPayload = { transactions: todaysTxs.length > 0 ? todaysTxs : txs.slice(0, 10) };
    } else if (parseResult.intent === 'SUPPLIER_QUERY') {
      // Very basic simulation for supplier
      answer = `You have received multiple deliveries recently. Please check the invoices section for exact supplier details.`;
      widgetType = 'SUPPLIER';
    } else {
      if (parseResult.intent === 'STOCK_IN' || parseResult.intent === 'STOCK_OUT') {
        answer = 'I am currently in Query Mode. To perform transactions, please use the Voice Console or Scanner.';
      } else {
        answer = 'I am not sure how to answer that. Could you try asking in a different way?';
      }
    }

    if (this.speechAdapter) {
      this.speechAdapter.speak(answer);
    }

    return { text: answer, widgetType, dataPayload };
  }
}
