export type ColorPalette = {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  accentMuted: string;
  accentText: string;
  danger: string;
  dangerMuted: string;
  success: string;
  successMuted: string;
  warning: string;
  warningMuted: string;
  skeleton: string;
};

export const lightColors: ColorPalette = {
  background: '#F4F1EA',
  surface: '#FFFDF8',
  surfaceMuted: '#E7E1D6',
  text: '#1C1915',
  textMuted: '#5E584E',
  border: '#D9D1C3',
  accent: '#B45309',
  accentMuted: '#FDE7C7',
  accentText: '#FFFDF8',
  danger: '#9F1239',
  dangerMuted: '#FCE7EF',
  success: '#3F6212',
  successMuted: '#E8F3D6',
  warning: '#92400E',
  warningMuted: '#FEF3C7',
  skeleton: '#E4DDD0',
};

export const darkColors: ColorPalette = {
  background: '#12110F',
  surface: '#1C1B18',
  surfaceMuted: '#2A2824',
  text: '#F6F1E7',
  textMuted: '#B7AFA2',
  border: '#3A362F',
  accent: '#F5B942',
  accentMuted: '#3A2E16',
  accentText: '#1C1406',
  danger: '#FB7185',
  dangerMuted: '#3F1D28',
  success: '#BEF264',
  successMuted: '#1E2A12',
  warning: '#FDBA74',
  warningMuted: '#3A2716',
  skeleton: '#2E2B26',
};
