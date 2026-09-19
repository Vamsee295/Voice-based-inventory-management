import { Product } from '../models/product';
import { INITIAL_PRODUCTS } from '../seed/seedData';

export interface IProductRepository {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  getBySku(sku: string): Promise<Product | null>;
  getByBarcode(barcode: string): Promise<Product | null>;
  save(product: Product): Promise<Product>;
  update(id: string, updates: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<boolean>;
  subscribe(listener: () => void): () => void;
}

const STORAGE_KEY = 'voicemate_inventory_products_v1';

export class LocalProductRepository implements IProductRepository {
  private memoryCache: Product[] = [...INITIAL_PRODUCTS];
  private listeners: Set<() => void> = new Set();
  private initialized = false;

  constructor() {
    this.initFromStorage();
  }

  private initFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.memoryCache = parsed;
          } else {
            this.persist();
          }
        } else {
          this.persist();
        }
        this.initialized = true;
      } catch (e) {
        console.warn('Failed to load products from localStorage, using memory cache:', e);
        this.initialized = true;
      }
    }
  }

  private persist(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memoryCache));
      } catch (e) {
        console.warn('Failed to persist products to localStorage:', e);
      }
    }
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Listener error in ProductRepository:', e);
      }
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async getAll(): Promise<Product[]> {
    if (!this.initialized) this.initFromStorage();
    return [...this.memoryCache];
  }

  public async getById(id: string): Promise<Product | null> {
    if (!this.initialized) this.initFromStorage();
    const found = this.memoryCache.find((p) => p.id === id);
    return found ? { ...found } : null;
  }

  public async getBySku(sku: string): Promise<Product | null> {
    if (!this.initialized) this.initFromStorage();
    const cleanSku = sku.trim().toLowerCase();
    const found = this.memoryCache.find((p) => p.sku.trim().toLowerCase() === cleanSku);
    return found ? { ...found } : null;
  }

  public async getByBarcode(barcode: string): Promise<Product | null> {
    if (!this.initialized) this.initFromStorage();
    const cleanBarcode = barcode.trim();
    const found = this.memoryCache.find((p) => p.barcode && p.barcode.trim() === cleanBarcode);
    return found ? { ...found } : null;
  }

  public async save(product: Product): Promise<Product> {
    if (!this.initialized) this.initFromStorage();
    const existingIndex = this.memoryCache.findIndex((p) => p.id === product.id);
    if (existingIndex >= 0) {
      this.memoryCache[existingIndex] = { ...product };
    } else {
      this.memoryCache.unshift({ ...product });
    }
    this.persist();
    return { ...product };
  }

  public async update(id: string, updates: Partial<Product>): Promise<Product> {
    if (!this.initialized) this.initFromStorage();
    const index = this.memoryCache.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Product with id "${id}" not found.`);
    }
    const updated: Product = {
      ...this.memoryCache[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.memoryCache[index] = updated;
    this.persist();
    return { ...updated };
  }

  public async delete(id: string): Promise<boolean> {
    if (!this.initialized) this.initFromStorage();
    const beforeLen = this.memoryCache.length;
    this.memoryCache = this.memoryCache.filter((p) => p.id !== id);
    if (this.memoryCache.length !== beforeLen) {
      this.persist();
      return true;
    }
    return false;
  }
}

export const productRepository = new LocalProductRepository();
