import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme, View } from 'react-native';

import {
  nextThemePreference,
  themeFor,
  type Theme,
  type ThemePreference,
} from '@/theme/theme';

const STORAGE_KEY = 'stormchaser.theme';

type ThemeContextValue = Theme & {
  setPreference: (preference: ThemePreference) => void;
  cyclePreference: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isPreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const resolvedScheme = systemScheme === 'dark' || systemScheme === 'light' ? systemScheme : null;
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (active && isPreference(stored)) {
          setPreferenceState(stored);
        }
      })
      .catch(() => {
        // Theme still follows the system if storage is unavailable.
      });
    return () => {
      active = false;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      // The in-memory choice still applies for this session.
    });
  }, []);

  const cyclePreference = useCallback(() => {
    setPreferenceState((current) => {
      const next = nextThemePreference(current);
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined);
      return next;
    });
  }, []);

  const theme = useMemo(() => themeFor(preference, resolvedScheme), [preference, resolvedScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      ...theme,
      setPreference,
      cyclePreference,
    }),
    [theme, setPreference, cyclePreference],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return value;
}
