import type { Coordinates } from '@/features/weather/weather.types';

/**
 * Best-effort place name from OpenStreetMap Nominatim.
 * Weather still loads if this fails; the UI falls back to coordinates.
 */
export async function reverseGeocode(coords: Coordinates): Promise<string | null> {
  const params = new URLSearchParams({
    format: 'jsonv2',
    lat: String(coords.latitude),
    lon: String(coords.longitude),
  });
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'StormChaserAssessment/1.0',
      },
    });
    if (!response.ok) {
      return null;
    }
    const body = (await response.json()) as {
      display_name?: string;
      address?: {
        city?: string;
        town?: string;
        village?: string;
        hamlet?: string;
        state?: string;
      };
    };
    const place =
      body.address?.city ?? body.address?.town ?? body.address?.village ?? body.address?.hamlet;
    if (place && body.address?.state) {
      return `${place}, ${body.address.state}`;
    }
    if (body.display_name) {
      return body.display_name.split(',').slice(0, 2).join(',').trim();
    }
    return null;
  } catch {
    return null;
  }
}
