import { getCloudProvider } from '@/features/cloud/supabase.provider';
import { deleteStormPhoto, persistStormPhoto } from '@/features/storms/storm.photos';
import { deleteStorm, getStorm, insertStorm, updateSyncStatus } from '@/features/storms/storm.repository';
import type { StormDraft, StormRecord } from '@/features/storms/storm.types';
import { createId, validateStormDraft } from '@/features/storms/storm.utils';
import { AppError } from '@/utils/errors';

export async function createStorm(draft: StormDraft): Promise<StormRecord> {
  const validation = validateStormDraft(draft);
  if (!validation.ok) {
    const message = Object.values(validation.errors)[0] ?? 'The storm report is incomplete.';
    throw new AppError('validation', message);
  }

  const id = createId();
  const photoUri = await persistStormPhoto(id, validation.value.photoUri);
  const timestamp = new Date().toISOString();
  const record: StormRecord = {
    id,
    photoUri,
    weatherConditions: validation.value.weatherConditions,
    latitude: validation.value.latitude,
    longitude: validation.value.longitude,
    capturedAt: validation.value.capturedAt,
    notes: validation.value.notes,
    stormType: validation.value.stormType,
    createdAt: timestamp,
    updatedAt: timestamp,
    syncStatus: 'local',
  };

  await insertStorm(record);
  return applyCloudSync(record);
}

export async function removeStorm(id: string): Promise<void> {
  const existing = await getStorm(id);
  await deleteStorm(id);
  if (existing) {
    deleteStormPhoto(existing.photoUri);
  }
}

export async function retryStormSync(id: string): Promise<StormRecord> {
  const record = await getStorm(id);
  if (!record) {
    throw new AppError('not_found', 'That storm report is no longer on this device.');
  }
  return applyCloudSync(record);
}

async function applyCloudSync(record: StormRecord): Promise<StormRecord> {
  const result = await getCloudProvider().pushStorm({
    id: record.id,
    weatherConditions: record.weatherConditions,
    latitude: record.latitude,
    longitude: record.longitude,
    capturedAt: record.capturedAt,
    notes: record.notes,
    stormType: record.stormType,
    createdAt: record.createdAt,
    hasPhoto: record.photoUri.length > 0,
  });
  if (result.status === 'synced') {
    await updateSyncStatus(record.id, 'synced');
    return { ...record, syncStatus: 'synced', updatedAt: new Date().toISOString() };
  }
  if (result.status === 'failed') {
    await updateSyncStatus(record.id, 'pending');
    return { ...record, syncStatus: 'pending', updatedAt: new Date().toISOString() };
  }
  return record;
}
