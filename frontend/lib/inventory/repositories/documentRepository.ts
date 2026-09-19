import { InvoiceDocument } from '../models/document';

export interface IDocumentRepository {
  getAll(): Promise<InvoiceDocument[]>;
  getById(id: string): Promise<InvoiceDocument | null>;
  save(document: InvoiceDocument): Promise<InvoiceDocument>;
  update(id: string, updates: Partial<InvoiceDocument>): Promise<InvoiceDocument>;
  subscribe(listener: () => void): () => void;
}

const STORAGE_KEY = 'voicemate_documents_v1';

export class LocalDocumentRepository implements IDocumentRepository {
  private memoryCache: InvoiceDocument[] = [];
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
        console.warn('Failed to load documents from localStorage, using memory cache:', e);
        this.initialized = true;
      }
    }
  }

  private persist(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memoryCache));
      } catch (e) {
        console.warn('Failed to persist documents to localStorage:', e);
      }
    }
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Error in document listener:', e);
      }
    });
  }

  public async getAll(): Promise<InvoiceDocument[]> {
    return [...this.memoryCache].sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  public async getById(id: string): Promise<InvoiceDocument | null> {
    return this.memoryCache.find((d) => d.id === id) || null;
  }

  public async save(document: InvoiceDocument): Promise<InvoiceDocument> {
    const existingIndex = this.memoryCache.findIndex((d) => d.id === document.id);
    if (existingIndex >= 0) {
      this.memoryCache[existingIndex] = { ...document };
    } else {
      this.memoryCache.push({ ...document });
    }
    this.persist();
    return document;
  }

  public async update(id: string, updates: Partial<InvoiceDocument>): Promise<InvoiceDocument> {
    const index = this.memoryCache.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new Error(`Document with id ${id} not found`);
    }
    this.memoryCache[index] = { ...this.memoryCache[index], ...updates };
    this.persist();
    return this.memoryCache[index];
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const documentRepository = new LocalDocumentRepository();
