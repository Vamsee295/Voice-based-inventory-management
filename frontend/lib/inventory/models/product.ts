export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  barcode?: string;
  currentStock: number;
  baseUnit: string;
  reorderLevel: number;
  price: number;
  expiryDate: string | null;
  unitConversions?: Record<string, number>; // e.g. { 'Bag': 25, 'Katta': 50 }
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDTO {
  name: string;
  sku: string;
  category: string;
  barcode?: string;
  openingStock: number;
  baseUnit: string;
  reorderLevel: number;
  price: number;
  expiryDate?: string | null;
  unitConversions?: Record<string, number>;
}

export interface UpdateProductDTO {
  name?: string;
  sku?: string;
  category?: string;
  barcode?: string;
  reorderLevel?: number;
  price?: number;
  expiryDate?: string | null;
  unitConversions?: Record<string, number>;
}
