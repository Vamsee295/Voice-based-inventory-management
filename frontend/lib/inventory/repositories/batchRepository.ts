import { InventoryBatch } from '../models/batch';

export interface IBatchRepository {
  getAll(): Promise<InventoryBatch[]>;
  save(batch: InventoryBatch): Promise<InventoryBatch>;
  update(id: string, updates: Partial<InventoryBatch>): Promise<InventoryBatch>;
  subscribe(listener: () => void): () => void;
}

const STORAGE_KEY = 'voicemate_batches_v1';

export class LocalBatchRepository implements IBatchRepository {
  private memoryCache: InventoryBatch[] = [];
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
          if (Array.isArray(parsed)) {
            this.memoryCache = parsed;
          }
        } else {
          this.seedInitialData();
        }
        this.initialized = true;
      } catch (e) {
        console.warn('Failed to load batches from localStorage, using memory cache:', e);
        this.initialized = true;
      }
    }
  }

  private seedInitialData() {
    const today = new Date();
    
    // Seed some batches with relative dates
    const addDays = (d: Date, days: number) => {
      const date = new Date(d);
      date.setDate(date.getDate() + days);
      return date.toISOString().split('T')[0];
    };

    const pastDate = addDays(today, -10);

    const seedBatches: InventoryBatch[] = [
      {
        id: 'AMUL-B1',
        productId: 'prod-003', // Assuming Amul Butter ID
        productName: 'Amul Butter 500g',
        productSku: 'DAIRY-AMUL-500',
        quantity: 12,
        unit: 'box',
        receivedDate: pastDate,
        expiryDate: addDays(today, 3), // EXPIRING SOON
        needsAttention: false,
      },
      {
        id: 'CURD-B1',
        productId: 'prod-004', // Assuming Curd ID
        productName: 'Curd 500g',
        productSku: 'DAIRY-CURD-500',
        quantity: 25,
        unit: 'packet',
        receivedDate: pastDate,
        expiryDate: addDays(today, 6), // UPCOMING
        needsAttention: false,
      },
      {
        id: 'BREAD-B1',
        productId: 'prod-005', // Let's just make one up for expired
        productName: 'Britannia Bread',
        productSku: 'BAKERY-BREAD-01',
        quantity: 5,
        unit: 'packet',
        receivedDate: pastDate,
        expiryDate: addDays(today, -1), // EXPIRED
        needsAttention: false,
      },
      {
        id: 'MILK-B1',
        productId: 'prod-006',
        productName: 'Milk 1L',
        productSku: 'DAIRY-MILK-1L',
        quantity: 10,
        unit: 'packet',
        receivedDate: pastDate,
        expiryDate: addDays(today, 0), // EXPIRING TODAY
        needsAttention: false,
      }
    ];

    this.memoryCache = seedBatches;
    this.persist();
  }

  private persist(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memoryCache));
      } catch (e) {
        console.warn('Failed to persist batches to localStorage:', e);
      }
    }
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Listener error in BatchRepository:', e);
      }
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async getAll(): Promise<InventoryBatch[]> {
    if (!this.initialized) this.initFromStorage();
    return [...this.memoryCache];
  }

  public async save(batch: InventoryBatch): Promise<InventoryBatch> {
    if (!this.initialized) this.initFromStorage();
    this.memoryCache.push({ ...batch });
    this.persist();
    return { ...batch };
  }

  public async update(id: string, updates: Partial<InventoryBatch>): Promise<InventoryBatch> {
    if (!this.initialized) this.initFromStorage();
    const idx = this.memoryCache.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Batch not found');
    
    this.memoryCache[idx] = { ...this.memoryCache[idx], ...updates };
    this.persist();
    return { ...this.memoryCache[idx] };
  }
}

export const batchRepository = new LocalBatchRepository();
