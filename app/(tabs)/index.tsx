import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { ForecastCard } from '@/components/ForecastCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { WeatherCard } from '@/components/WeatherCard';
import {
  formatCoordinates,
  formatPrecipitation,
  formatTemperature,
  formatWind,
} from '@/features/weather/weather.utils';
import { useLocation } from '@/hooks/useLocation';
import { useWeather } from '@/hooks/useWeather';
import { useTheme } from '@/theme/ThemeProvider';
import { formatDateTime, formatDay, formatHour } from '@/utils/date';

export default function WeatherScreen() {
  const { colors, spacing, typography, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const location = useLocation();
  const weather = useWeather(location.coords, location.label);
  const [refreshing, setRefreshing] = useState(false);
  const snapshot = weather.snapshot;

  async function onRefresh() {
    setRefreshing(true);
    try {
      if (location.isSample) {
        await weather.refresh();
      } else {
        await location.refresh();
        await weather.refresh();
      }
    } finally {
      setRefreshing(false);
    }
  }

  let body = null;
  if ((location.status === 'loading' && !location.coords) || (weather.status === 'loading' && !snapshot)) {
    body = <LoadingSkeleton variant="weather" />;
  } else if (location.status === 'blocked' || !location.coords) {
    body = (
      <EmptyState
        title="Location needed"
        message={location.message ?? 'Turn on location to load weather for where you are.'}
        actionLabel="Try location again"
        onAction={() => {
          void location.refresh();
        }}
        secondaryActionLabel="Use Norman, Oklahoma"
        onSecondaryAction={location.useSample}
      />
    );
  } else if (weather.status === 'not_found' || !snapshot) {
    body = (
      <EmptyState
        title="Not found"
        message={weather.message ?? 'Weather data could not be retrieved for this location.'}
        actionLabel="Try again"
        onAction={() => {
          void weather.refresh();
        }}
      />
    );
  } else {
    const place = location.label ?? snapshot.locationLabel ?? 'Current location';
    body = (
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void onRefresh();
            }}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        <View style={{ gap: 4 }}>
          <Text style={[typography.heading, { color: colors.text }]}>{place}</Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            {formatCoordinates(location.coords.latitude, location.coords.longitude)}
            {location.isSample ? ' · sample target' : ''}
          </Text>
        </View>

        <View style={[styles.banner, { backgroundColor: bannerColor(snapshot.source, colors), borderRadius: radius.md }]}>
          <Text style={[typography.caption, { color: colors.text }]}>{sourceCopy(snapshot.source, snapshot.fetchedAt, snapshot.timeZone)}</Text>
        </View>

        <WeatherCard snapshot={snapshot} />

        <Text style={[typography.label, { color: colors.textMuted }]}>🌦️ NEXT 12 HOURS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.forecastRow}>
          {snapshot.hourly.map((hour) => (
            <ForecastCard
              key={hour.time}
              title={formatHour(hour.time, snapshot.timeZone)}
              condition={hour.conditionLabel}
              primary={formatTemperature(hour.temperatureC)}
              secondary={`${hour.precipitationProbabilityPercent}% · ${formatWind(hour.windSpeedKmh)}`}
            />
          ))}
        </ScrollView>

        <Text style={[typography.label, { color: colors.textMuted }]}>🌦️ FIVE-DAY OUTLOOK</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.forecastRow}>
          {snapshot.daily.map((day) => (
            <ForecastCard
              key={day.date}
              title={formatDay(day.date)}
              condition={day.conditionLabel}
              primary={`${formatTemperature(day.temperatureMaxC)} / ${formatTemperature(day.temperatureMinC)}`}
              secondary={`${formatPrecipitation(day.precipitationSumMm)} · gusts ${Math.round(day.windGustMaxKmh)} km/h`}
            />
          ))}
        </ScrollView>
      </ScrollView>
    );
  }

  return (
    <View style={[styles.page, { backgroundColor: colors.background, paddingTop: insets.top + spacing.sm }]}>
      <ScreenHeader title="Conditions" subtitle="Open-Meteo" />
      {body}
    </View>
  );
}

function sourceCopy(source: 'live' | 'mock', fetchedAt: string, timeZone: string): string {
  const when = formatDateTime(fetchedAt, source === 'live' ? timeZone : undefined);
  if (source === 'mock') {
    return `Mock data. Open-Meteo was unavailable. Generated ${when}.`;
  }
  return `Open-Meteo updated ${when}.`;
}

function bannerColor(
  source: 'live' | 'mock',
  colors: { successMuted: string; accentMuted: string },
): string {
  if (source === 'mock') return colors.accentMuted;
  return colors.successMuted;
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  banner: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  forecastRow: {
    gap: 10,
    paddingRight: 4,
  },
});
