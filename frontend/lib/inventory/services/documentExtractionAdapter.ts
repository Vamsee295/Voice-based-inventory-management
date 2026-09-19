import { DocumentType } from '../models/document';

export interface ExtractedDocumentData {
  documentNumber: string;
  documentType: DocumentType;
  supplierName: string;
  documentDate: string;
  subtotal: number;
  tax: number;
  total: number;
  items: ExtractedItem[];
}

export interface ExtractedItem {
  rawDescription: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface IDocumentExtractionAdapter {
  extractDocument(file: File | { name: string; type: string }): Promise<ExtractedDocumentData>;
}

export class MockDocumentExtractionAdapter implements IDocumentExtractionAdapter {
  public async extractDocument(file: File | { name: string; type: string }): Promise<ExtractedDocumentData> {
    // Simulate OCR delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const fileName = file.name.toLowerCase();

    // Route based on fake file name content for demo purposes
    if (fileName.includes('challan') || fileName.includes('sri sai')) {
      return this.getChallanPreset();
    }
    
    if (fileName.includes('ambiguous') || fileName.includes('oil')) {
      return this.getAmbiguousPreset();
    }

    // Default: ABC Distributors
    return this.getDefaultInvoicePreset();
  }

  private getDefaultInvoicePreset(): ExtractedDocumentData {
    return {
      documentNumber: `INV-2026-${Math.floor(Math.random() * 9000) + 1000}`,
      documentType: 'INVOICE',
      supplierName: 'ABC Distributors',
      documentDate: new Date().toISOString().split('T')[0],
      subtotal: 12450,
      tax: 622.5,
      total: 13072.5,
      items: [
        {
          rawDescription: 'Sona Masoori Rice 25kg',
          quantity: 10,
          unit: 'Bag',
          unitPrice: 550,
          totalPrice: 5500,
          batchNumber: 'SM0926A',
          expiryDate: '2027-03-15',
        },
        {
          rawDescription: 'Sugar Medium S-30',
          quantity: 5,
          unit: 'Packet',
          unitPrice: 42,
          totalPrice: 210,
        }
      ],
    };
  }

  private getChallanPreset(): ExtractedDocumentData {
    return {
      documentNumber: `CH-${Math.floor(Math.random() * 9000) + 1000}`,
      documentType: 'CHALLAN',
      supplierName: 'Sri Sai Traders',
      documentDate: new Date().toISOString().split('T')[0],
      subtotal: 0,
      tax: 0,
      total: 0,
      items: [
        {
          rawDescription: 'Tata Salt Crystal Carton',
          quantity: 2,
          unit: 'Carton',
          unitPrice: 0,
          totalPrice: 0,
        },
        {
          rawDescription: 'Aashirvaad Atta 10kg',
          quantity: 15,
          unit: 'Packet',
          unitPrice: 0,
          totalPrice: 0,
        }
      ],
    };
  }

  private getAmbiguousPreset(): ExtractedDocumentData {
    return {
      documentNumber: `INV-2026-${Math.floor(Math.random() * 9000) + 1000}`,
      documentType: 'INVOICE',
      supplierName: 'Metro Cash & Carry',
      documentDate: new Date().toISOString().split('T')[0],
      subtotal: 8100,
      tax: 405,
      total: 8505,
      items: [
        {
          rawDescription: 'Sunflower Refined Oil 15L',
          quantity: 4,
          unit: 'Tin',
          unitPrice: 2025,
          totalPrice: 8100,
        }
      ],
    };
  }
}

export const documentExtractionAdapter = new MockDocumentExtractionAdapter();
