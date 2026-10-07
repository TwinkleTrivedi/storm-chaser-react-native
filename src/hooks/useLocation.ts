import { useEffect, useSyncExternalStore } from 'react';
import * as Location from 'expo-location';

import type { Coordinates } from '@/features/weather/weather.types';
import { reverseGeocode } from '@/utils/geocode';
import { requestLocationAccess } from '@/utils/permissions';

/** Norman, Oklahoma — a practical sample target when the device location is unavailable. */
export const SAMPLE_LOCATION = {
  latitude: 35.2226,
  longitude: -97.4395,
  label: 'Norman, Oklahoma',
} as const;

export type LocationStatus = 'loading' | 'ready' | 'blocked';

type LocationSnapshot = {
  status: LocationStatus;
  coords: Coordinates | null;
  label: string | null;
  isSample: boolean;
  message: string | null;
};

const listeners = new Set<() => void>();
let requestId = 0;
let started = false;
let snapshot: LocationSnapshot = {
  status: 'loading',
  coords: null,
  label: null,
  isSample: false,
  message: null,
};

function emit(next: LocationSnapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

async function refreshLocation(): Promise<void> {
  const id = ++requestId;
  emit({ ...snapshot, status: 'loading', message: null });
  try {
    const permission = await requestLocationAccess();
    if (id !== requestId) return;
    if (permission !== 'granted') {
      emit({
        status: 'blocked',
        coords: null,
        label: null,
        isSample: false,
        message: 'Location permission is off, so live weather cannot be loaded.',
      });
      return;
    }

    const position = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      15_000,
    );
    if (id !== requestId) return;
    const coords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    emit({ status: 'ready', coords, label: null, isSample: false, message: null });

    const place = await reverseGeocode(coords);
    if (id !== requestId || !place) return;
    emit({ ...snapshot, label: place });
  } catch {
    if (id !== requestId) return;
    emit({
      status: 'blocked',
      coords: null,
      label: null,
      isSample: false,
      message: 'The device location could not be read.',
    });
  }
}

function useSampleLocation(): void {
  requestId += 1;
  emit({
    status: 'ready',
    coords: { latitude: SAMPLE_LOCATION.latitude, longitude: SAMPLE_LOCATION.longitude },
    label: SAMPLE_LOCATION.label,
    isSample: true,
    message: null,
  });
}

export function useLocation() {
  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!started) {
      started = true;
      void refreshLocation();
    }
  }, []);

  return {
    ...value,
    refresh: refreshLocation,
    useSample: useSampleLocation,
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Location request timed out.')), ms);
    promise.then(
      (result) => {
        clearTimeout(timer);
        resolve(result);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
