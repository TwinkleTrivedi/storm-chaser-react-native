import { fetchForecast } from '@/features/weather/weather.api';
import { buildMockWeather } from '@/features/weather/weather.mock';
import type { Coordinates, WeatherSnapshot } from '@/features/weather/weather.types';
import { isValidCoordinate, parseWeatherResponse } from '@/features/weather/weather.utils';
import { AppError } from '@/utils/errors';

const NOT_FOUND_MESSAGE = 'Weather data could not be retrieved for this location.';

/** Live Open-Meteo forecast. Mock data is used only when that request fails. */
export async function loadWeather(
  coords: Coordinates,
  locationLabel: string | null,
): Promise<WeatherSnapshot> {
  if (!isValidCoordinate(coords.latitude, coords.longitude)) {
    throw new AppError('not_found', NOT_FOUND_MESSAGE);
  }

  try {
    const payload = await fetchForecast(coords);
    return parseWeatherResponse(payload, coords, locationLabel);
  } catch {
    return buildMockWeather(coords, locationLabel);
  }
}
