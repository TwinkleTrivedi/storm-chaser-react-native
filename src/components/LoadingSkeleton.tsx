import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type Variant = 'weather' | 'list' | 'detail';

export function LoadingSkeleton({ variant = 'list' }: { variant?: Variant }) {
  const { colors, radius, spacing } = useTheme();
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  const block = (height: number, width: number | `${number}%`, extra?: object) => (
    <Animated.View
      style={[
        {
          height,
          width,
          borderRadius: radius.md,
          backgroundColor: colors.skeleton,
          opacity,
        },
        extra,
      ]}
    />
  );

  if (variant === 'detail') {
    return (
      <View style={[styles.page, { padding: spacing.xl, gap: spacing.md, backgroundColor: colors.background }]}>
        {block(280, '100%')}
        {block(24, '60%')}
        {block(16, '80%')}
        {block(16, '70%')}
      </View>
    );
  }

  if (variant === 'weather') {
    return (
      <View style={[styles.page, { padding: spacing.xl, gap: spacing.lg, backgroundColor: colors.background }]}>
        {block(18, 120)}
        {block(72, 180)}
        <View style={styles.grid}>
          {block(72, '48%')}
          {block(72, '48%')}
          {block(72, '48%')}
          {block(72, '48%')}
        </View>
        <View style={styles.row}>
          {block(110, 132)}
          {block(110, 132)}
          {block(110, 132)}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.page, { padding: spacing.xl, gap: spacing.md, backgroundColor: colors.background }]}>
      {block(96, '100%')}
      {block(96, '100%')}
      {block(96, '100%')}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
});
