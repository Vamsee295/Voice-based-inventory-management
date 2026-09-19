import { InventoryTransaction } from '../models/transaction';
import { INITIAL_TRANSACTIONS } from '../seed/seedData';

export interface ITransactionRepository {
  getAll(): Promise<InventoryTransaction[]>;
  getByProductId(productId: string): Promise<InventoryTransaction[]>;
  getRecent(limit?: number): Promise<InventoryTransaction[]>;
  save(tx: InventoryTransaction): Promise<InventoryTransaction>;
  subscribe(listener: () => void): () => void;
}

const STORAGE_KEY = 'voicemate_inventory_transactions_v1';

export class LocalTransactionRepository implements ITransactionRepository {
  private memoryCache: InventoryTransaction[] = [...INITIAL_TRANSACTIONS];
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
        console.warn('Failed to load transactions from localStorage, using memory cache:', e);
        this.initialized = true;
      }
    }
  }

  private persist(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memoryCache));
      } catch (e) {
        console.warn('Failed to persist transactions to localStorage:', e);
      }
    }
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Listener error in TransactionRepository:', e);
      }
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async getAll(): Promise<InventoryTransaction[]> {
    if (!this.initialized) this.initFromStorage();
    return [...this.memoryCache];
  }

  public async getByProductId(productId: string): Promise<InventoryTransaction[]> {
    if (!this.initialized) this.initFromStorage();
    return this.memoryCache.filter((tx) => tx.productId === productId);
  }

  public async getRecent(limit: number = 10): Promise<InventoryTransaction[]> {
    if (!this.initialized) this.initFromStorage();
    return this.memoryCache.slice(0, limit);
  }

  public async save(tx: InventoryTransaction): Promise<InventoryTransaction> {
    if (!this.initialized) this.initFromStorage();
    // Prepend to maintain newest first
    this.memoryCache.unshift({ ...tx });
    this.persist();
    return { ...tx };
  }
}

export const transactionRepository = new LocalTransactionRepository();
