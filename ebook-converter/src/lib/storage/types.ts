// src/lib/storage/types.ts
export interface StoreResult {
  key: string;
  url: string;
  expiresAt: number;
  backend: 'r2' | 'local';
}

export interface StorageStrategy {
  store(key: string, buffer: Buffer, ttlHours?: number): Promise<StoreResult>;
  retrieve(key: string): Promise<Buffer | null>;
  remove(key: string): Promise<void>;
  cleanupExpired(): Promise<{ r2: number; local: number }>;
}
