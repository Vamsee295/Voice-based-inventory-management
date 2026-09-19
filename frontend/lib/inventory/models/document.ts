export type DocumentType = 'INVOICE' | 'CHALLAN';

export type DocumentStatus = 
  | 'UPLOADED' 
  | 'PROCESSING' 
  | 'REVIEW_REQUIRED' 
  | 'READY_TO_APPLY' 
  | 'APPLIED' 
  | 'REJECTED';

export type MatchConfidence = 'EXACT' | 'HIGH' | 'UNCERTAIN' | 'NONE';

export interface CandidateMatch {
  id: string;
  name: string;
  sku: string;
}

export interface InvoiceItem {
  id: string;
  rawDescription: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  
  // Matching fields
  matchedProductId?: string;
  matchedProductName?: string;
  matchedSku?: string;
  matchConfidence: MatchConfidence;
  candidateMatches?: CandidateMatch[];
  
  // TUNE Normalization
  normalizedQuantity?: number;
  normalizedUnit?: string;
  tuneConversionNote?: string;
  
  // Expiry / Batch
  batchNumber?: string;
  expiryDate?: string;
  
  // Validation
  validationErrors?: string[];
}

export interface InvoiceDocument {
  id: string;
  documentNumber: string;
  documentType: DocumentType;
  supplierName: string;
  documentDate: string;
  uploadedAt: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: DocumentStatus;
  createdBy: string;
  appliedAt?: string;
  transactionIds?: string[];
}
