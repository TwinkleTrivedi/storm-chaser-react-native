export const STORM_TYPES = [
  'thunderstorm',
  'supercell',
  'tornado',
  'hail',
  'flash-flood',
  'derecho',
  'winter-storm',
  'tropical',
  'other',
] as const;

export type StormType = (typeof STORM_TYPES)[number];

export type SyncStatus = 'local' | 'pending' | 'synced';

export type StormRecord = {
  id: string;
  photoUri: string;
  weatherConditions: string;
  latitude: number;
  longitude: number;
  capturedAt: string;
  notes: string;
  stormType: StormType;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
};

export type StormDraft = {
  photoUri: string | null;
  weatherConditions: string;
  latitude: number | null;
  longitude: number | null;
  capturedAt: string | null;
  notes: string;
  stormType: StormType | null;
};

export type StormField = 'photoUri' | 'weatherConditions' | 'location' | 'capturedAt' | 'notes' | 'stormType';

export type StormValidation =
  | {
      ok: true;
      value: {
        photoUri: string;
        weatherConditions: string;
        latitude: number;
        longitude: number;
        capturedAt: string;
        notes: string;
        stormType: StormType;
      };
    }
  | { ok: false; errors: Partial<Record<StormField, string>> };

export const STORM_TYPE_OPTIONS: { value: StormType; label: string }[] = [
  { value: 'thunderstorm', label: 'Thunderstorm' },
  { value: 'supercell', label: 'Supercell' },
  { value: 'tornado', label: 'Tornado' },
  { value: 'hail', label: 'Hail' },
  { value: 'flash-flood', label: 'Flash flood' },
  { value: 'derecho', label: 'Derecho' },
  { value: 'winter-storm', label: 'Winter storm' },
  { value: 'tropical', label: 'Tropical' },
  { value: 'other', label: 'Other' },
];
