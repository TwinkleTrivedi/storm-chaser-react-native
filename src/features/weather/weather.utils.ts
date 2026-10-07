import type {
  ChaseOutlook,
  Coordinates,
  CurrentConditions,
  DailyForecast,
  HourlyForecast,
  OpenMeteoForecastResponse,
  WeatherSnapshot,
} from '@/features/weather/weather.types';

const CARDINALS = [
  'N',
  'NNE',
  'NE',
  'ENE',
  'E',
  'ESE',
  'SE',
  'SSE',
  'S',
  'SSW',
  'SW',
  'WSW',
  'W',
  'WNW',
  'NW',
  'NNW',
] as const;

const WMO_LABELS: Record<number, string> = {
  0: 'Clear',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  56: 'Freezing drizzle',
  57: 'Heavy freezing drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Heavy freezing rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Light showers',
  81: 'Showers',
  82: 'Violent showers',
  85: 'Snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Heavy thunderstorm with hail',
};

const EARTH_RADIUS_M = 6_371_000;

export function weatherCodeLabel(code: number): string {
  return WMO_LABELS[code] ?? 'Unknown conditions';
}

export function degreesToCardinal(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % CARDINALS.length;
  return CARDINALS[index] ?? 'N';
}

export function isValidCoordinate(latitude: number, longitude: number): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export function formatCoordinates(latitude: number, longitude: number): string {
  const latHemisphere = latitude >= 0 ? 'N' : 'S';
  const lonHemisphere = longitude >= 0 ? 'E' : 'W';
  return `${Math.abs(latitude).toFixed(4)}° ${latHemisphere}, ${Math.abs(longitude).toFixed(4)}° ${lonHemisphere}`;
}

export function formatTemperature(celsius: number): string {
  return `${Math.round(celsius)}°`;
}

export function formatWind(kmh: number, directionDeg?: number): string {
  const speed = `${Math.round(kmh)} km/h`;
  if (directionDeg == null) {
    return speed;
  }
  return `${speed} ${degreesToCardinal(directionDeg)}`;
}

export function formatPrecipitation(mm: number): string {
  return `${mm.toFixed(1)} mm`;
}

export function formatPressure(hpa: number): string {
  return `${Math.round(hpa)} hPa`;
}

export function formatVisibility(meters: number | null): string {
  if (meters == null) {
    return '—';
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/** Great-circle distance between two coordinates, in meters. */
export function distanceMeters(a: Coordinates, b: Coordinates): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latDelta = toRadians(b.latitude - a.latitude);
  const lonDelta = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const h =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(lonDelta / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * A chase-oriented summary of the current observation.
 * Thunderstorm codes and strong gusts are "active". Rain or a stiff wind is "watch".
 */
export function chaseOutlook(input: {
  weatherCode: number;
  windSpeedKmh: number;
  windGustKmh: number;
  precipitationMm: number;
}): ChaseOutlook {
  const convective = input.weatherCode >= 95;
  const severeWind = input.windGustKmh >= 80 || input.windSpeedKmh >= 60;
  if (convective || severeWind) {
    return 'active';
  }

  const wet =
    input.precipitationMm >= 1 || (input.weatherCode >= 51 && input.weatherCode <= 86);
  const breezy = input.windSpeedKmh >= 30 || input.windGustKmh >= 45;
  if (wet || breezy) {
    return 'watch';
  }
  return 'quiet';
}

export function outlookLabel(outlook: ChaseOutlook): string {
  if (outlook === 'active') return 'Active';
  if (outlook === 'watch') return 'Watch';
  return 'Quiet';
}

export function describeConditions(current: CurrentConditions): string {
  return [
    current.conditionLabel,
    formatTemperature(current.temperatureC),
    `wind ${formatWind(current.windSpeedKmh, current.windDirectionDeg)}`,
    `gusts ${Math.round(current.windGustKmh)} km/h`,
    `precip ${formatPrecipitation(current.precipitationMm)}`,
  ].join(', ');
}

/**
 * Open-Meteo local timestamps have no offset. Subtract utc_offset_seconds
 * after parsing the wall clock as UTC to get the real instant.
 */
export function locationTimeToIso(localTime: string, utcOffsetSeconds: number): string {
  const normalized = localTime.length === 16 ? `${localTime}:00` : localTime;
  const parsed = Date.parse(normalized.endsWith('Z') ? normalized : `${normalized}Z`);
  if (Number.isNaN(parsed)) {
    throw new Error(`Unreadable forecast time: ${localTime}`);
  }
  return new Date(parsed - utcOffsetSeconds * 1000).toISOString();
}

export function selectUpcomingHours(
  hours: HourlyForecast[],
  now: Date,
  count: number,
): HourlyForecast[] {
  const cutoff = now.getTime() - 30 * 60 * 1000;
  const upcoming = hours.filter((hour) => {
    const time = Date.parse(hour.time);
    return !Number.isNaN(time) && time >= cutoff;
  });
  const source = upcoming.length > 0 ? upcoming : hours;
  return source.slice(0, count);
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function requireNumber(value: unknown, label: string): number {
  const number = asNumber(value);
  if (number == null) {
    throw new Error(`Weather payload is missing ${label}.`);
  }
  return number;
}

export function parseWeatherResponse(
  payload: OpenMeteoForecastResponse,
  coords: Coordinates,
  locationLabel: string | null,
  now = new Date(),
): WeatherSnapshot {
  const current = payload.current;
  if (!current?.time) {
    throw new Error('Weather payload is missing current conditions.');
  }

  const offset = asNumber(payload.utc_offset_seconds) ?? 0;
  const weatherCode = requireNumber(current.weather_code, 'weather code');
  const conditions: CurrentConditions = {
    observedAt: locationTimeToIso(current.time, offset),
    temperatureC: requireNumber(current.temperature_2m, 'temperature'),
    apparentTemperatureC: asNumber(current.apparent_temperature) ?? requireNumber(current.temperature_2m, 'temperature'),
    humidityPercent: asNumber(current.relative_humidity_2m) ?? 0,
    precipitationMm: asNumber(current.precipitation) ?? 0,
    windSpeedKmh: requireNumber(current.wind_speed_10m, 'wind speed'),
    windGustKmh: asNumber(current.wind_gusts_10m) ?? requireNumber(current.wind_speed_10m, 'wind speed'),
    windDirectionDeg: asNumber(current.wind_direction_10m) ?? 0,
    pressureHpa: asNumber(current.pressure_msl) ?? 0,
    cloudCoverPercent: asNumber(current.cloud_cover) ?? 0,
    visibilityM: asNumber(current.visibility),
    weatherCode,
    conditionLabel: weatherCodeLabel(weatherCode),
    isDay: current.is_day !== 0,
  };

  const hourly = zipHourly(payload.hourly, offset);
  const daily = zipDaily(payload.daily);

  return {
    location: coords,
    locationLabel,
    timeZone: payload.timezone && payload.timezone.length > 0 ? payload.timezone : 'UTC',
    current: conditions,
    hourly: selectUpcomingHours(hourly, now, 12),
    daily: daily.slice(0, 5),
    fetchedAt: now.toISOString(),
    source: 'live',
  };
}

function zipHourly(hourly: OpenMeteoForecastResponse['hourly'], offset: number): HourlyForecast[] {
  if (!hourly?.time) {
    return [];
  }
  const hours: HourlyForecast[] = [];
  hourly.time.forEach((time, index) => {
    const temperature = asNumber(hourly.temperature_2m?.[index]);
    const code = asNumber(hourly.weather_code?.[index]);
    if (temperature == null || code == null) {
      return;
    }
    try {
      hours.push({
        time: locationTimeToIso(time, offset),
        temperatureC: temperature,
        precipitationProbabilityPercent: asNumber(hourly.precipitation_probability?.[index]) ?? 0,
        precipitationMm: asNumber(hourly.precipitation?.[index]) ?? 0,
        windSpeedKmh: asNumber(hourly.wind_speed_10m?.[index]) ?? 0,
        windGustKmh: asNumber(hourly.wind_gusts_10m?.[index]) ?? 0,
        weatherCode: code,
        conditionLabel: weatherCodeLabel(code),
      });
    } catch {
      // Skip a single unreadable hour rather than failing the whole forecast.
    }
  });
  return hours;
}

function zipDaily(daily: OpenMeteoForecastResponse['daily']): DailyForecast[] {
  if (!daily?.time) {
    return [];
  }
  const days: DailyForecast[] = [];
  daily.time.forEach((time, index) => {
    const code = asNumber(daily.weather_code?.[index]);
    const max = asNumber(daily.temperature_2m_max?.[index]);
    const min = asNumber(daily.temperature_2m_min?.[index]);
    if (code == null || max == null || min == null) {
      return;
    }
    days.push({
      date: time.slice(0, 10),
      weatherCode: code,
      conditionLabel: weatherCodeLabel(code),
      temperatureMaxC: max,
      temperatureMinC: min,
      precipitationSumMm: asNumber(daily.precipitation_sum?.[index]) ?? 0,
      precipitationProbabilityMaxPercent: asNumber(daily.precipitation_probability_max?.[index]) ?? 0,
      windSpeedMaxKmh: asNumber(daily.wind_speed_10m_max?.[index]) ?? 0,
      windGustMaxKmh: asNumber(daily.wind_gusts_10m_max?.[index]) ?? 0,
    });
  });
  return days;
}
