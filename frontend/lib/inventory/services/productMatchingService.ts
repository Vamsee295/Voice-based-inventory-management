import { ExtractedItem, ExtractedDocumentData } from './documentExtractionAdapter';
import { InvoiceItem, InvoiceDocument, MatchConfidence } from '../models/document';
import { inventoryService } from './inventoryService';
import { unitService } from '../units/unitService';
import { Product } from '../models/product';

export class ProductMatchingService {
  public async processExtractedDocument(data: ExtractedDocumentData): Promise<Omit<InvoiceDocument, 'id' | 'status' | 'createdBy'>> {
    const allProducts = await inventoryService.getAllProducts();
    
    const processedItems: InvoiceItem[] = [];
    
    for (const item of data.items) {
      const processedItem = await this.matchAndNormalizeItem(item, allProducts);
      processedItems.push(processedItem);
    }
    
    return {
      documentNumber: data.documentNumber,
      documentType: data.documentType,
      supplierName: data.supplierName,
      documentDate: data.documentDate,
      uploadedAt: new Date().toISOString(),
      subtotal: data.subtotal,
      tax: data.tax,
      total: data.total,
      items: processedItems,
    };
  }

  public async matchAndNormalizeItem(item: ExtractedItem, allProducts: Product[]): Promise<InvoiceItem> {
    const rawDesc = item.rawDescription.toLowerCase();
    
    // Simple matching heuristic
    let matchedProduct: Product | undefined;
    let confidence: MatchConfidence = 'NONE';
    const candidates: Product[] = [];
    
    for (const p of allProducts) {
      const name = p.name.toLowerCase();
      const sku = p.sku.toLowerCase();
      
      // Exact / High confidence match (contains name or SKU)
      if (rawDesc.includes(name) || rawDesc.includes(sku) || name.includes(rawDesc)) {
        matchedProduct = p;
        confidence = 'HIGH';
        break;
      }
      
      // Fuzzy / Uncertain match (shares words)
      const rawWords = rawDesc.split(' ').filter(w => w.length > 3);
      const nameWords = name.split(' ').filter(w => w.length > 3);
      
      const intersection = rawWords.filter(w => nameWords.includes(w));
      if (intersection.length > 0) {
        candidates.push(p);
      }
    }
    
    if (!matchedProduct && candidates.length === 1) {
      matchedProduct = candidates[0];
      confidence = 'HIGH';
    } else if (!matchedProduct && candidates.length > 1) {
      confidence = 'UNCERTAIN';
    }

    const invoiceItem: InvoiceItem = {
      id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      rawDescription: item.rawDescription,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      matchConfidence: confidence,
      batchNumber: item.batchNumber,
      expiryDate: item.expiryDate,
      validationErrors: [],
    };

    if (confidence === 'UNCERTAIN' && candidates.length > 0) {
      invoiceItem.candidateMatches = candidates.map(c => ({ id: c.id, name: c.name, sku: c.sku }));
    }

    if (matchedProduct) {
      this.applyProductMatch(invoiceItem, matchedProduct);
    } else if (confidence === 'NONE' || confidence === 'UNCERTAIN') {
      invoiceItem.validationErrors!.push('Product match required.');
    }

    return invoiceItem;
  }

  public applyProductMatch(invoiceItem: InvoiceItem, product: Product): void {
    invoiceItem.matchedProductId = product.id;
    invoiceItem.matchedProductName = product.name;
    invoiceItem.matchedSku = product.sku;
    
    // Clear candidates if it was uncertain before but now matched
    invoiceItem.matchConfidence = 'HIGH';
    
    // Remove "Product match required" error if it exists
    invoiceItem.validationErrors = invoiceItem.validationErrors?.filter(e => e !== 'Product match required.') || [];

    // Attempt TUNE Normalization
    try {
      if (!unitService.isUnitSupported(invoiceItem.unit) && 
          !Object.keys(product.unitConversions || {}).some(u => u.toLowerCase() === invoiceItem.unit.toLowerCase())) {
        invoiceItem.validationErrors!.push(`Unit "${invoiceItem.unit}" is not configured for this product.`);
      } else {
        const norm = unitService.normalize(product, invoiceItem.quantity, invoiceItem.unit);
        invoiceItem.normalizedQuantity = norm.normalizedQuantity;
        invoiceItem.normalizedUnit = norm.normalizedUnit;
        invoiceItem.tuneConversionNote = norm.note;
        
        // Remove unit error if present
        invoiceItem.validationErrors = invoiceItem.validationErrors!.filter(e => !e.startsWith('Unit'));
      }
    } catch (e: any) {
      invoiceItem.validationErrors!.push(e.message || 'Unit normalization failed.');
    }
  }
}

export const productMatchingService = new ProductMatchingService();
