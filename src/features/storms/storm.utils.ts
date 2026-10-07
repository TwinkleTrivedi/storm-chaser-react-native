import type { StormDraft, StormField, StormType, StormValidation } from '@/features/storms/storm.types';
import { STORM_TYPES, STORM_TYPE_OPTIONS } from '@/features/storms/storm.types';
import { isValidCoordinate } from '@/features/weather/weather.utils';

const CONDITIONS_MAX = 240;
const NOTES_MAX = 500;

export function isStormType(value: string): value is StormType {
  return (STORM_TYPES as readonly string[]).includes(value);
}

export function stormTypeLabel(type: StormType): string {
  return STORM_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? 'Other';
}

export function syncStatusLabel(status: 'local' | 'pending' | 'synced'): string {
  if (status === 'synced') return 'Synced';
  if (status === 'pending') return 'Sync pending';
  return 'On device';
}

export function createId(): string {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }
  return `storm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function validateStormDraft(draft: StormDraft): StormValidation {
  const errors: Partial<Record<StormField, string>> = {};
  const conditions = draft.weatherConditions.trim();
  const notes = draft.notes.trim();

  if (!draft.photoUri) {
    errors.photoUri = 'Capture or choose a photo.';
  }
  if (!draft.stormType) {
    errors.stormType = 'Choose a storm type.';
  }
  if (!conditions) {
    errors.weatherConditions = 'Describe the weather you are seeing.';
  } else if (conditions.length > CONDITIONS_MAX) {
    errors.weatherConditions = `Keep conditions under ${CONDITIONS_MAX} characters.`;
  }
  if (notes.length > NOTES_MAX) {
    errors.notes = `Keep notes under ${NOTES_MAX} characters.`;
  }
  if (
    draft.latitude == null ||
    draft.longitude == null ||
    !isValidCoordinate(draft.latitude, draft.longitude)
  ) {
    errors.location = 'A location is required.';
  }
  if (!draft.capturedAt || Number.isNaN(Date.parse(draft.capturedAt))) {
    errors.capturedAt = 'Date and time are missing.';
  }

  if (
    Object.keys(errors).length > 0 ||
    !draft.photoUri ||
    !draft.stormType ||
    draft.latitude == null ||
    draft.longitude == null ||
    !draft.capturedAt
  ) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      photoUri: draft.photoUri,
      weatherConditions: conditions,
      latitude: draft.latitude,
      longitude: draft.longitude,
      capturedAt: draft.capturedAt,
      notes,
      stormType: draft.stormType,
    },
  };
}

export type MapPoint = {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
};

export type CoordinateBounds = {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
};

export function coordinateBounds(points: { latitude: number; longitude: number }[]): CoordinateBounds {
  const latitudes = points.map((point) => point.latitude);
  const longitudes = points.map((point) => point.longitude);
  return {
    minLat: Math.min(...latitudes),
    maxLat: Math.max(...latitudes),
    minLon: Math.min(...longitudes),
    maxLon: Math.max(...longitudes),
  };
}

/**
 * Leaflet document for the chase map. Point data is JSON-encoded so labels
 * cannot break out of the script tag.
 */
export function buildStormMapHtml(points: MapPoint[]): string {
  const payload = JSON.stringify(points).replace(/</g, '\\u003c');
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; background: #12110f; }
    .leaflet-control-attribution { font-size: 10px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const points = ${payload};
    const map = L.map('map');
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    const bounds = [];
    function selectPoint(id) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(id);
        return;
      }
      if (window.parent) {
        window.parent.postMessage(id, '*');
      }
    }
    for (const point of points) {
      const marker = L.circleMarker([point.latitude, point.longitude], {
        radius: 9,
        color: '#1c1406',
        weight: 2,
        fillColor: '#f5b942',
        fillOpacity: 0.95
      }).addTo(map);
      marker.bindTooltip(point.label, { permanent: points.length < 8, direction: 'top' });
      marker.on('click', function () { selectPoint(point.id); });
      bounds.push([point.latitude, point.longitude]);
    }
    if (bounds.length === 1) {
      map.setView(bounds[0], 8);
    } else if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [36, 36] });
    }
  </script>
</body>
</html>`;
}
