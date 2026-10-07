export type CloudSyncResult =
  | { status: 'synced' }
  | { status: 'skipped'; reason: string }
  | { status: 'failed'; reason: string };

export type CloudStormPayload = {
  id: string;
  weatherConditions: string;
  latitude: number;
  longitude: number;
  capturedAt: string;
  notes: string;
  stormType: string;
  createdAt: string;
  hasPhoto: boolean;
};

export interface CloudSyncProvider {
  readonly name: string;
  isConfigured(): boolean;
  pushStorm(record: CloudStormPayload): Promise<CloudSyncResult>;
}
