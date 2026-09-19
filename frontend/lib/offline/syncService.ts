export interface OfflineOperation {
  id: string;
  url: string;
  method: string;
  body: any;
  timestamp: string;
  status: 'PENDING' | 'SYNCING' | 'FAILED';
  retryCount: number;
}

class OfflineSyncService {
  private queueKey = 'voicemate_offline_queue';
  private isSyncing = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.sync.bind(this));
    }
  }

  public enqueue(url: string, method: string, body: any) {
    const operation: OfflineOperation = {
      id: `op-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      url,
      method,
      body,
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      retryCount: 0
    };

    const queue = this.getQueue();
    queue.push(operation);
    this.saveQueue(queue);

    // Try to sync immediately if online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      this.sync();
    }
  }

  public async sync() {
    if (this.isSyncing) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    
    this.isSyncing = true;
    const queue = this.getQueue().filter(op => op.status === 'PENDING' || op.status === 'FAILED');
    
    for (const op of queue) {
      if (op.retryCount >= 5) continue; // Max retries
      
      op.status = 'SYNCING';
      this.updateOperation(op);

      try {
        const res = await fetch(op.url, {
          method: op.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(op.body)
        });

        if (res.ok) {
          this.removeOperation(op.id);
        } else {
          // If 4xx error (e.g. invalid auth or bad request), don't retry forever
          if (res.status >= 400 && res.status < 500 && res.status !== 429) {
            this.removeOperation(op.id);
          } else {
            op.status = 'FAILED';
            op.retryCount += 1;
            this.updateOperation(op);
          }
        }
      } catch (err) {
        op.status = 'FAILED';
        op.retryCount += 1;
        this.updateOperation(op);
      }
    }

    this.isSyncing = false;
  }

  public getQueue(): OfflineOperation[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(this.queueKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveQueue(queue: OfflineOperation[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.queueKey, JSON.stringify(queue));
  }

  private updateOperation(operation: OfflineOperation) {
    const queue = this.getQueue();
    const idx = queue.findIndex(o => o.id === operation.id);
    if (idx !== -1) {
      queue[idx] = operation;
      this.saveQueue(queue);
    }
  }

  private removeOperation(id: string) {
    const queue = this.getQueue();
    this.saveQueue(queue.filter(o => o.id !== id));
  }
}

export const syncService = new OfflineSyncService();
