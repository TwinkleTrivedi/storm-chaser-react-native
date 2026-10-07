import { useCallback, useEffect, useRef, useState } from 'react';

import { loadWeather } from '@/features/weather/weather.service';
import type { Coordinates, WeatherSnapshot } from '@/features/weather/weather.types';
import { toAppError } from '@/utils/errors';

export type WeatherStatus = 'idle' | 'loading' | 'ready' | 'not_found';

export function useWeather(coords: Coordinates | null, locationLabel: string | null) {
  const [status, setStatus] = useState<WeatherStatus>(coords ? 'loading' : 'idle');
  const [snapshot, setSnapshot] = useState<WeatherSnapshot | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const requestRef = useRef(0);
  const labelRef = useRef(locationLabel);
  labelRef.current = locationLabel;

  const refresh = useCallback(async () => {
    if (!coords) {
      return;
    }
    const request = ++requestRef.current;
    setStatus((current) => (current === 'ready' ? current : 'loading'));
    setMessage(null);
    try {
      const next = await loadWeather(coords, labelRef.current);
      if (request !== requestRef.current) {
        return;
      }
      setSnapshot(next);
      setStatus('ready');
    } catch (error) {
      if (request !== requestRef.current) {
        return;
      }
      setSnapshot(null);
      setStatus('not_found');
      setMessage(toAppError(error).message);
    }
  }, [coords]);

  useEffect(() => {
    if (!coords) {
      setStatus('idle');
      setSnapshot(null);
      return;
    }
    void refresh();
  }, [coords, refresh]);

  return { status, snapshot, message, refresh };
}
