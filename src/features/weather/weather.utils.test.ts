/// <reference types="jest" />
import type { OpenMeteoForecastResponse } from '@/features/weather/weather.types';
import {
  chaseOutlook,
  degreesToCardinal,
  distanceMeters,
  formatCoordinates,
  isValidCoordinate,
  locationTimeToIso,
  parseWeatherResponse,
  selectUpcomingHours,
  weatherCodeLabel,
} from '@/features/weather/weather.utils';

describe('weather utils', () => {
  test('maps wind direction to a 16-point compass', () => {
    expect(degreesToCardinal(0)).toBe('N');
    expect(degreesToCardinal(90)).toBe('E');
    expect(degreesToCardinal(225)).toBe('SW');
    expect(degreesToCardinal(337.5)).toBe('NNW');
    expect(degreesToCardinal(360)).toBe('N');
    expect(degreesToCardinal(-10)).toBe('N');
  });

  test('labels WMO weather codes used by storm chasers', () => {
    expect(weatherCodeLabel(0)).toBe('Clear');
    expect(weatherCodeLabel(61)).toBe('Light rain');
    expect(weatherCodeLabel(95)).toBe('Thunderstorm');
    expect(weatherCodeLabel(999)).toBe('Unknown conditions');
  });

  test('rates chase conditions from wind and storm codes', () => {
    expect(chaseOutlook({ weatherCode: 95, windSpeedKmh: 10, windGustKmh: 12, precipitationMm: 0 })).toBe('active');
    expect(chaseOutlook({ weatherCode: 2, windSpeedKmh: 20, windGustKmh: 80, precipitationMm: 0 })).toBe('active');
    expect(chaseOutlook({ weatherCode: 61, windSpeedKmh: 12, windGustKmh: 18, precipitationMm: 0.2 })).toBe('watch');
    expect(chaseOutlook({ weatherCode: 0, windSpeedKmh: 8, windGustKmh: 12, precipitationMm: 0 })).toBe('quiet');
  });

  test('rejects coordinates outside the valid range', () => {
    expect(isValidCoordinate(35.22, -97.44)).toBe(true);
    expect(isValidCoordinate(91, 0)).toBe(false);
    expect(isValidCoordinate(0, Number.NaN)).toBe(false);
  });

  test('formats hemispheres and measures distance', () => {
    expect(formatCoordinates(35.5, -97.5)).toBe('35.5000° N, 97.5000° W');
    expect(distanceMeters({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 0 })).toBe(0);
    const oneDegree = distanceMeters({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 1 });
    expect(oneDegree).toBeGreaterThan(110_000);
    expect(oneDegree).toBeLessThan(112_000);
  });

  test('converts Open-Meteo local time using the UTC offset', () => {
    expect(locationTimeToIso('2026-10-07T15:00', -18_000)).toBe('2026-10-07T20:00:00.000Z');
  });

  test('parses a forecast and keeps only upcoming hours', () => {
    const now = new Date('2026-10-07T18:00:00.000Z');
    const payload: OpenMeteoForecastResponse = {
      timezone: 'America/Chicago',
      utc_offset_seconds: 0,
      current: {
        time: '2026-10-07T18:00',
        temperature_2m: 22.4,
        apparent_temperature: 21,
        relative_humidity_2m: 60,
        precipitation: 0.4,
        weather_code: 80,
        cloud_cover: 70,
        pressure_msl: 1012,
        wind_speed_10m: 28,
        wind_direction_10m: 180,
        wind_gusts_10m: 40,
        visibility: 16000,
        is_day: 1,
      },
      hourly: {
        time: ['2026-10-07T16:00', '2026-10-07T18:00', '2026-10-07T19:00'],
        temperature_2m: [20, 22, 21],
        precipitation_probability: [10, 40, 55],
        precipitation: [0, 0.2, 1],
        wind_speed_10m: [15, 28, 30],
        wind_gusts_10m: [20, 40, 44],
        weather_code: [2, 80, 95],
      },
      daily: {
        time: ['2026-10-07', '2026-10-08'],
        weather_code: [95, 3],
        temperature_2m_max: [26, 24],
        temperature_2m_min: [16, 15],
        precipitation_sum: [12, 0],
        precipitation_probability_max: [80, 10],
        wind_speed_10m_max: [40, 18],
        wind_gusts_10m_max: [60, 25],
      },
    };

    const snapshot = parseWeatherResponse(payload, { latitude: 35.2, longitude: -97.4 }, 'Norman', now);
    expect(snapshot.current.conditionLabel).toBe('Light showers');
    expect(snapshot.current.temperatureC).toBe(22.4);
    expect(snapshot.timeZone).toBe('America/Chicago');
    expect(snapshot.hourly.map((hour) => hour.time)).toEqual([
      '2026-10-07T18:00:00.000Z',
      '2026-10-07T19:00:00.000Z',
    ]);
    expect(snapshot.daily).toHaveLength(2);
    expect(snapshot.daily[0]?.conditionLabel).toBe('Thunderstorm');
    expect(snapshot.source).toBe('live');
  });

  test('falls back to the latest hours when every timestamp is in the past', () => {
    const hours = selectUpcomingHours(
      [
        {
          time: '2020-01-01T00:00:00.000Z',
          temperatureC: 1,
          precipitationProbabilityPercent: 0,
          precipitationMm: 0,
          windSpeedKmh: 1,
          windGustKmh: 1,
          weatherCode: 0,
          conditionLabel: 'Clear',
        },
      ],
      new Date('2026-10-07T00:00:00.000Z'),
      12,
    );
    expect(hours).toHaveLength(1);
  });

  test('rejects a payload without current conditions', () => {
    expect(() => parseWeatherResponse({}, { latitude: 0, longitude: 0 }, null)).toThrow(
      /current conditions/,
    );
  });
});
