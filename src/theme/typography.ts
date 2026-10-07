import type { TextStyle } from 'react-native';

export const typography = {
  display: {
    fontSize: 64,
    fontWeight: '700',
    letterSpacing: -2,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
} satisfies Record<string, TextStyle>;
