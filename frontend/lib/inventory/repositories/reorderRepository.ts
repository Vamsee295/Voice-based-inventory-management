import { ReorderRecord } from '../models/reorder';

export interface IReorderRepository {
  getAll(): Promise<ReorderRecord[]>;
  save(reorder: ReorderRecord): Promise<ReorderRecord>;
  update(id: string, updates: Partial<ReorderRecord>): Promise<ReorderRecord>;
  subscribe(listener: () => void): () => void;
}

const STORAGE_KEY = 'voicemate_reorders_v1';

export class LocalReorderRepository implements IReorderRepository {
  private memoryCache: ReorderRecord[] = [];
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
        }
        this.initialized = true;
      } catch (e) {
        console.warn('Failed to load reorders from localStorage, using memory cache:', e);
        this.initialized = true;
      }
    }
  }

  private persist(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memoryCache));
      } catch (e) {
        console.warn('Failed to persist reorders to localStorage:', e);
      }
    }
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Listener error in ReorderRepository:', e);
      }
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async getAll(): Promise<ReorderRecord[]> {
    if (!this.initialized) this.initFromStorage();
    return [...this.memoryCache];
  }

  public async save(reorder: ReorderRecord): Promise<ReorderRecord> {
    if (!this.initialized) this.initFromStorage();
    // Prepend to maintain newest first
    this.memoryCache.unshift({ ...reorder });
    this.persist();
    return { ...reorder };
  }

  public async update(id: string, updates: Partial<ReorderRecord>): Promise<ReorderRecord> {
    if (!this.initialized) this.initFromStorage();
    
    const index = this.memoryCache.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`Reorder with ID ${id} not found.`);
    }

    const updatedReorder = { ...this.memoryCache[index], ...updates };
    this.memoryCache[index] = updatedReorder;
    
    this.persist();
    return { ...updatedReorder };
  }
}

export const reorderRepository = new LocalReorderRepository();
