import type { Coordinates, OpenMeteoForecastResponse } from '@/features/weather/weather.types';

/** https://open-meteo.com/en/docs — no API key. */
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

const CURRENT_FIELDS = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'precipitation',
  'weather_code',
  'cloud_cover',
  'pressure_msl',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
  'visibility',
  'is_day',
].join(',');

const HOURLY_FIELDS = [
  'temperature_2m',
  'precipitation_probability',
  'precipitation',
  'wind_speed_10m',
  'wind_gusts_10m',
  'weather_code',
].join(',');

const DAILY_FIELDS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_sum',
  'precipitation_probability_max',
  'wind_speed_10m_max',
  'wind_gusts_10m_max',
].join(',');

export async function fetchForecast(coords: Coordinates): Promise<OpenMeteoForecastResponse> {
  const params = new URLSearchParams({
    latitude: String(coords.latitude),
    longitude: String(coords.longitude),
    current: CURRENT_FIELDS,
    hourly: HOURLY_FIELDS,
    daily: DAILY_FIELDS,
    forecast_days: '5',
    timezone: 'auto',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(`${FORECAST_URL}?${params.toString()}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    const body = (await response.json()) as OpenMeteoForecastResponse & {
      error?: boolean;
      reason?: string;
    };
    if (!response.ok || body.error) {
      throw new Error(body.reason ?? `Open-Meteo responded with ${response.status}.`);
    }
    return body;
  } finally {
    clearTimeout(timer);
  }
}
