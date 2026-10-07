import { getDatabase } from '@/database/database';
import type { StormRecord, StormType, SyncStatus } from '@/features/storms/storm.types';
import { isStormType } from '@/features/storms/storm.utils';

type StormRow = {
  id: string;
  photo_uri: string;
  weather_conditions: string;
  latitude: number;
  longitude: number;
  captured_at: string;
  notes: string;
  storm_type: string;
  created_at: string;
  updated_at: string;
  sync_status: string;
};

function mapRow(row: StormRow): StormRecord {
  const stormType: StormType = isStormType(row.storm_type) ? row.storm_type : 'other';
  const syncStatus: SyncStatus =
    row.sync_status === 'pending' || row.sync_status === 'synced' ? row.sync_status : 'local';
  return {
    id: row.id,
    photoUri: row.photo_uri,
    weatherConditions: row.weather_conditions,
    latitude: row.latitude,
    longitude: row.longitude,
    capturedAt: row.captured_at,
    notes: row.notes,
    stormType,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    syncStatus,
  };
}

export async function listStorms(): Promise<StormRecord[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<StormRow>('SELECT * FROM storms ORDER BY captured_at DESC');
  return rows.map(mapRow);
}

export async function getStorm(id: string): Promise<StormRecord | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<StormRow>('SELECT * FROM storms WHERE id = ?', [id]);
  return row ? mapRow(row) : null;
}

export async function insertStorm(record: StormRecord): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO storms (
      id, photo_uri, weather_conditions, latitude, longitude, captured_at,
      notes, storm_type, created_at, updated_at, sync_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      record.photoUri,
      record.weatherConditions,
      record.latitude,
      record.longitude,
      record.capturedAt,
      record.notes,
      record.stormType,
      record.createdAt,
      record.updatedAt,
      record.syncStatus,
    ],
  );
}

export async function deleteStorm(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM storms WHERE id = ?', [id]);
}

export async function updateSyncStatus(id: string, status: SyncStatus): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE storms SET sync_status = ?, updated_at = ? WHERE id = ?', [
    status,
    new Date().toISOString(),
    id,
  ]);
}
