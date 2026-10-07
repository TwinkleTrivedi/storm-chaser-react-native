import { darkColors, lightColors, type ColorPalette } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ColorScheme = 'light' | 'dark';

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
} as const;

export type Theme = {
  preference: ThemePreference;
  scheme: ColorScheme;
  colors: ColorPalette;
  spacing: typeof spacing;
  typography: typeof typography;
  radius: typeof radius;
};

export function nextThemePreference(preference: ThemePreference): ThemePreference {
  if (preference === 'system') return 'light';
  if (preference === 'light') return 'dark';
  return 'system';
}

export function themeFor(
  preference: ThemePreference,
  systemScheme: 'light' | 'dark' | null | undefined,
): Theme {
  const scheme: ColorScheme =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
  return {
    preference,
    scheme,
    colors: scheme === 'dark' ? darkColors : lightColors,
    spacing,
    typography,
    radius,
  };
}

export function themePreferenceLabel(preference: ThemePreference): string {
  if (preference === 'system') return 'System';
  if (preference === 'light') return 'Light';
  return 'Dark';
}
