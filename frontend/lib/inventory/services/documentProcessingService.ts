import { InvoiceDocument, InvoiceItem } from '../models/document';
import { documentRepository } from '../repositories/documentRepository';
import { inventoryService } from './inventoryService';
import { batchRepository } from '../repositories/batchRepository';
import { productMatchingService } from './productMatchingService';
import { documentExtractionAdapter } from './documentExtractionAdapter';

export class DocumentProcessingService {
  /**
   * Main entrypoint to upload a file, run mock extraction, match SKUs,
   * and save as a REVIEW_REQUIRED or READY_TO_APPLY document.
   */
  public async uploadAndProcess(file: File | { name: string; type: string }, uploaderName: string): Promise<InvoiceDocument> {
    const extractedData = await documentExtractionAdapter.extractDocument(file);
    
    const processedDoc = await productMatchingService.processExtractedDocument(extractedData);
    
    let hasUncertainties = false;
    for (const item of processedDoc.items) {
      if (item.matchConfidence === 'UNCERTAIN' || item.matchConfidence === 'NONE' || (item.validationErrors && item.validationErrors.length > 0)) {
        hasUncertainties = true;
      }
    }
    
    const docId = `DOC-${Date.now()}`;
    const newDoc: InvoiceDocument = {
      ...processedDoc,
      id: docId,
      status: hasUncertainties ? 'REVIEW_REQUIRED' : 'READY_TO_APPLY',
      createdBy: uploaderName,
    };
    
    return await documentRepository.save(newDoc);
  }

  /**
   * Final Commit & Apply
   */
  public async confirmAndApply(documentId: string, operatorName: string): Promise<InvoiceDocument> {
    const doc = await documentRepository.getById(documentId);
    if (!doc) {
      throw new Error(`Document ${documentId} not found.`);
    }
    
    if (doc.status === 'APPLIED') {
      throw new Error(`Document ${doc.documentNumber} is already APPLIED.`);
    }

    // Double check validations
    const hasErrors = doc.items.some(item => (item.validationErrors && item.validationErrors.length > 0) || !item.matchedProductId);
    if (hasErrors) {
      throw new Error('Document has validation errors or unmatched products. Please resolve them before applying.');
    }

    const txIds: string[] = [];

    // Process each item
    for (const item of doc.items) {
      if (!item.matchedProductId || !item.normalizedQuantity || !item.normalizedUnit) {
        continue; // Should not happen given the check above
      }

      // 1. Stock In
      const stockResult = await inventoryService.stockIn({
        productId: item.matchedProductId,
        quantity: item.quantity,
        unit: item.unit,
        source: doc.documentType, // INVOICE or CHALLAN
        note: `${doc.documentType} ${doc.documentNumber}`,
        createdBy: operatorName
      });

      if (!stockResult.success || !stockResult.data) {
        throw new Error(`Stock In failed for ${item.rawDescription}: ${stockResult.error}`);
      }
      
      txIds.push(stockResult.data.transaction.id);

      // 2. Batch Creation (Phase 5 Integration)
      if (item.batchNumber && item.expiryDate) {
        const batchId = `${item.matchedProductId}-${item.batchNumber}`;
        const existingBatch = await batchRepository.getAll().then(bs => bs.find(b => b.id === batchId));
        
        if (existingBatch) {
          await batchRepository.update(batchId, {
            quantity: existingBatch.quantity + item.normalizedQuantity
          });
        } else {
          await batchRepository.save({
            id: batchId,
            productId: item.matchedProductId,
            productName: item.matchedProductName!,
            productSku: item.matchedSku!,
            quantity: item.normalizedQuantity,
            unit: item.normalizedUnit,
            receivedDate: new Date().toISOString(),
            expiryDate: item.expiryDate,
            needsAttention: false,
            batchNumber: item.batchNumber,
            sourceDocument: doc.documentNumber
          });
        }
      }
    }

    // Update Document Status
    const updatedDoc = await documentRepository.update(documentId, {
      status: 'APPLIED',
      appliedAt: new Date().toISOString(),
      transactionIds: txIds,
    });

    return updatedDoc;
  }
}

export const documentProcessingService = new DocumentProcessingService();
