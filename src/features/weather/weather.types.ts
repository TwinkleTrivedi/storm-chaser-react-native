export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type WeatherSource = 'live' | 'mock';

export type ChaseOutlook = 'quiet' | 'watch' | 'active';

export type CurrentConditions = {
  observedAt: string;
  temperatureC: number;
  apparentTemperatureC: number;
  humidityPercent: number;
  precipitationMm: number;
  windSpeedKmh: number;
  windGustKmh: number;
  windDirectionDeg: number;
  pressureHpa: number;
  cloudCoverPercent: number;
  visibilityM: number | null;
  weatherCode: number;
  conditionLabel: string;
  isDay: boolean;
};

export type HourlyForecast = {
  time: string;
  temperatureC: number;
  precipitationProbabilityPercent: number;
  precipitationMm: number;
  windSpeedKmh: number;
  windGustKmh: number;
  weatherCode: number;
  conditionLabel: string;
};

export type DailyForecast = {
  date: string;
  weatherCode: number;
  conditionLabel: string;
  temperatureMaxC: number;
  temperatureMinC: number;
  precipitationSumMm: number;
  precipitationProbabilityMaxPercent: number;
  windSpeedMaxKmh: number;
  windGustMaxKmh: number;
};

export type WeatherSnapshot = {
  location: Coordinates;
  locationLabel: string | null;
  timeZone: string;
  current: CurrentConditions;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  fetchedAt: string;
  source: WeatherSource;
};

/** Fields this app reads from the Open-Meteo forecast endpoint. */
export type OpenMeteoForecastResponse = {
  timezone?: string;
  utc_offset_seconds?: number;
  current?: {
    time?: string;
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    weather_code?: number;
    cloud_cover?: number;
    pressure_msl?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
    wind_gusts_10m?: number;
    visibility?: number;
    is_day?: number;
  };
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    precipitation_probability?: number[];
    precipitation?: number[];
    wind_speed_10m?: number[];
    wind_gusts_10m?: number[];
    weather_code?: number[];
  };
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_sum?: number[];
    precipitation_probability_max?: number[];
    wind_speed_10m_max?: number[];
    wind_gusts_10m_max?: number[];
  };
};
