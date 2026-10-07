import type { CloudStormPayload, CloudSyncProvider, CloudSyncResult } from '@/features/cloud/cloud.types';

type SupabaseConfig = {
  url: string;
  anonKey: string;
};

/**
 * Optional Supabase metadata sync.
 * Binary photos stay on the device. No keys are bundled; set
 * EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY locally.
 */
export function createSupabaseCloudProvider(): CloudSyncProvider {
  return {
    name: 'supabase',
    isConfigured(): boolean {
      return readConfig() !== null;
    },
    async pushStorm(record: CloudStormPayload): Promise<CloudSyncResult> {
      const config = readConfig();
      if (!config) {
        return {
          status: 'skipped',
          reason: 'Cloud sync is not configured. Reports stay on this device.',
        };
      }

      try {
        const response = await fetch(`${config.url}/rest/v1/storms`, {
          method: 'POST',
          headers: {
            apikey: config.anonKey,
            Authorization: `Bearer ${config.anonKey}`,
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates,return=minimal',
          },
          body: JSON.stringify({
            id: record.id,
            weather_conditions: record.weatherConditions,
            latitude: record.latitude,
            longitude: record.longitude,
            captured_at: record.capturedAt,
            notes: record.notes,
            storm_type: record.stormType,
            created_at: record.createdAt,
            has_photo: record.hasPhoto,
          }),
        });
        if (!response.ok) {
          return {
            status: 'failed',
            reason: `Cloud sync failed (${response.status}). The report is still saved on this device.`,
          };
        }
        return { status: 'synced' };
      } catch {
        return {
          status: 'failed',
          reason: 'Cloud sync failed. The report is still saved on this device.',
        };
      }
    },
  };
}

let provider = createSupabaseCloudProvider();

export function getCloudProvider(): CloudSyncProvider {
  return provider;
}

/** Test hook. Production code uses the Supabase provider created above. */
export function setCloudProvider(next: CloudSyncProvider): void {
  provider = next;
}

function readConfig(): SupabaseConfig | null {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    return null;
  }
  return { url: url.replace(/\/$/, ''), anonKey };
}
