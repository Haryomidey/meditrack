export type SyncItemType = 'SALE' | 'DRUG_UPDATE' | 'PRESCRIPTION';

export interface SyncQueueItem {
  type: SyncItemType;
  data: Record<string, unknown>;
  timestamp: number;
  deviceId: string;
  opKey?: string;
}

export interface SyncResultItem {
  opKey: string;
  type: SyncItemType;
  status: 'applied' | 'conflict' | 'failed' | 'duplicate';
  message?: string;
  result?: Record<string, unknown>;
}
