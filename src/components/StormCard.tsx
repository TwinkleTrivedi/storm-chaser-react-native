import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { StormRecord } from '@/features/storms/storm.types';
import { stormTypeLabel, syncStatusLabel } from '@/features/storms/storm.utils';
import { formatCoordinates } from '@/features/weather/weather.utils';
import { useTheme } from '@/theme/ThemeProvider';
import { formatDateTime } from '@/utils/date';

type Props = {
  storm: StormRecord;
  onPress: () => void;
  compact?: boolean;
};

export function StormCard({ storm, onPress, compact = false }: Props) {
  const { colors, radius, typography } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${stormTypeLabel(storm.stormType)} report`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact ? styles.compact : null,
        {
          backgroundColor: pressed ? colors.surfaceMuted : colors.surface,
          borderColor: colors.border,
          borderRadius: radius.md,
        },
      ]}
    >
      <Image
        source={{ uri: storm.photoUri }}
        style={[styles.image, compact ? styles.imageCompact : null, { backgroundColor: colors.surfaceMuted }]}
        contentFit="cover"
        accessibilityLabel="Storm photo"
      />
      <View style={styles.copy}>
        <Text style={[typography.heading, { color: colors.text, fontSize: compact ? 15 : 18 }]}>
          {stormTypeLabel(storm.stormType)}
        </Text>
        <Text style={[typography.caption, { color: colors.textMuted, marginTop: 4 }]} numberOfLines={compact ? 1 : 2}>
          {formatDateTime(storm.capturedAt)}
        </Text>
        {compact ? null : (
          <Text style={[typography.caption, { color: colors.text, marginTop: 6 }]} numberOfLines={2}>
            {storm.weatherConditions}
          </Text>
        )}
        <Text style={[typography.caption, { color: colors.textMuted, marginTop: 6 }]} numberOfLines={1}>
          {formatCoordinates(storm.latitude, storm.longitude)} · {syncStatusLabel(storm.syncStatus)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderWidth: 1,
  },
  compact: {
    width: 280,
  },
  image: {
    width: 84,
    height: 84,
    borderRadius: 10,
  },
  imageCompact: {
    width: 56,
    height: 56,
  },
  copy: {
    flex: 1,
  },
});
