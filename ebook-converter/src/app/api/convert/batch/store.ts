// src/app/api/convert/batch/store.ts
// Re-export the Redis-backed batch store from lib/
export {
  saveBatch as saveBatch,
  getBatch as getBatch,
  deleteBatch as deleteBatch,
  updateBatch as batchStoreUpdate,
  cleanupExpiredBatches,
} from "@/lib/batch-store";

export type { BatchFileItem, BatchJobData } from "@/lib/batch-store";
