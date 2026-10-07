import { StyleSheet, Text, View } from 'react-native';

import type { WeatherSnapshot } from '@/features/weather/weather.types';
import {
  chaseOutlook,
  formatPrecipitation,
  formatPressure,
  formatTemperature,
  formatVisibility,
  formatWind,
  outlookLabel,
} from '@/features/weather/weather.utils';
import { useTheme } from '@/theme/ThemeProvider';
import type { ColorPalette } from '@/theme/colors';

type Props = {
  snapshot: WeatherSnapshot;
};

export function WeatherCard({ snapshot }: Props) {
  const { colors, radius, spacing, typography } = useTheme();
  const current = snapshot.current;
  const outlook = chaseOutlook({
    weatherCode: current.weatherCode,
    windSpeedKmh: current.windSpeedKmh,
    windGustKmh: current.windGustKmh,
    precipitationMm: current.precipitationMm,
  });
  const tone = outlookTone(colors, outlook);

  const metrics = [
    { label: 'Wind', value: formatWind(current.windSpeedKmh, current.windDirectionDeg) },
    { label: 'Gusts', value: formatWind(current.windGustKmh) },
    { label: 'Precip', value: formatPrecipitation(current.precipitationMm) },
    { label: 'Humidity', value: `${Math.round(current.humidityPercent)}%` },
    { label: 'Pressure', value: formatPressure(current.pressureHpa) },
    { label: 'Cloud', value: `${Math.round(current.cloudCoverPercent)}%` },
    { label: 'Visibility', value: formatVisibility(current.visibilityM) },
    { label: 'Feels like', value: formatTemperature(current.apparentTemperatureC) },
  ];

  return (
    <View style={{ gap: spacing.md }}>
      <View style={styles.tempRow}>
        <Text style={[typography.display, { color: colors.text }]}>{formatTemperature(current.temperatureC)}</Text>
        <View style={[styles.pill, { backgroundColor: tone.background, borderRadius: radius.pill }]}>
          <Text style={[typography.label, { color: tone.text }]}>{outlookLabel(outlook).toUpperCase()}</Text>
        </View>
      </View>
      <Text style={[typography.heading, { color: colors.text }]}>{current.conditionLabel}</Text>
      <Text style={[typography.caption, { color: colors.textMuted }]}>
        {current.isDay ? 'Daylight observation' : 'Night observation'} · code {current.weatherCode}
      </Text>
      <View style={styles.grid}>
        {metrics.map((metric) => (
          <View
            key={metric.label}
            style={[
              styles.tile,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.md,
              },
            ]}
          >
            <Text style={[typography.label, { color: colors.textMuted }]}>{metric.label.toUpperCase()}</Text>
            <Text style={[typography.heading, { color: colors.text, marginTop: 6 }]}>{metric.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function outlookTone(colors: ColorPalette, outlook: 'quiet' | 'watch' | 'active') {
  if (outlook === 'active') {
    return { background: colors.dangerMuted, text: colors.danger };
  }
  if (outlook === 'watch') {
    return { background: colors.warningMuted, text: colors.warning };
  }
  return { background: colors.successMuted, text: colors.success };
}

const styles = StyleSheet.create({
  tempRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  tile: {
    width: '48.5%',
    padding: 14,
    borderWidth: 1,
  },
});
