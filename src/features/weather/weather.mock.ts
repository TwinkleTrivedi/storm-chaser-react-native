import type { Coordinates, WeatherSnapshot } from '@/features/weather/weather.types';
import { weatherCodeLabel } from '@/features/weather/weather.utils';

/** Stand-in forecast used when the Open-Meteo request cannot be completed. */
export function buildMockWeather(
  coords: Coordinates,
  locationLabel: string | null,
  now = new Date(),
): WeatherSnapshot {
  const hourly = Array.from({ length: 12 }, (_, index) => {
    const code = index >= 4 ? 95 : 80;
    return {
      time: new Date(now.getTime() + index * 60 * 60 * 1000).toISOString(),
      temperatureC: 24 - index * 0.6,
      precipitationProbabilityPercent: Math.min(95, 25 + index * 6),
      precipitationMm: index >= 4 ? 1.4 : 0.2,
      windSpeedKmh: 34 + index * 1.5,
      windGustKmh: 52 + index * 2,
      weatherCode: code,
      conditionLabel: weatherCodeLabel(code),
    };
  });

  const daily = Array.from({ length: 5 }, (_, index) => {
    const code = index === 0 ? 95 : index < 3 ? 81 : 2;
    const day = new Date(now.getTime() + index * 24 * 60 * 60 * 1000);
    return {
      date: day.toISOString().slice(0, 10),
      weatherCode: code,
      conditionLabel: weatherCodeLabel(code),
      temperatureMaxC: 27 - index,
      temperatureMinC: 18 - index * 0.4,
      precipitationSumMm: index < 3 ? 8 + index : 0.4,
      precipitationProbabilityMaxPercent: index < 3 ? 70 : 20,
      windSpeedMaxKmh: 48 - index * 4,
      windGustMaxKmh: 72 - index * 6,
    };
  });

  return {
    location: coords,
    locationLabel,
    timeZone: 'UTC',
    current: {
      observedAt: now.toISOString(),
      temperatureC: 24,
      apparentTemperatureC: 26,
      humidityPercent: 72,
      precipitationMm: 1.8,
      windSpeedKmh: 36,
      windGustKmh: 58,
      windDirectionDeg: 210,
      pressureHpa: 1004,
      cloudCoverPercent: 88,
      visibilityM: 12000,
      weatherCode: 95,
      conditionLabel: weatherCodeLabel(95),
      isDay: true,
    },
    hourly,
    daily,
    fetchedAt: now.toISOString(),
    source: 'mock',
  };
}
