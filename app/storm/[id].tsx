import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { getCloudProvider } from '@/features/cloud/supabase.provider';
import { stormTypeLabel, syncStatusLabel } from '@/features/storms/storm.utils';
import { formatCoordinates } from '@/features/weather/weather.utils';
import { useStorms } from '@/hooks/useStorms';
import { useTheme } from '@/theme/ThemeProvider';
import { formatDateTime } from '@/utils/date';
import { toAppError } from '@/utils/errors';

export default function StormDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const stormId = typeof id === 'string' ? id : '';
  const { colors, spacing, typography, radius, scheme } = useTheme();
  const { storms, loading, find, remove, retrySync } = useStorms();
  const storm = find(stormId);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  async function onDelete() {
    setWorking(true);
    try {
      await remove(stormId);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/storms');
      }
    } catch (error) {
      setSyncMessage(toAppError(error).message);
      setWorking(false);
    }
  }

  function confirmDelete() {
    Alert.alert('Delete this report?', 'The photo and notes will be removed from this device.', [
      { text: 'Keep', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void onDelete() },
    ]);
  }

  async function onSync() {
    setWorking(true);
    setSyncMessage(null);
    try {
      const updated = await retrySync(stormId);
      setSyncMessage(updated.syncStatus === 'synced' ? 'Metadata synced.' : syncStatusLabel(updated.syncStatus));
    } catch (error) {
      setSyncMessage(toAppError(error).message);
    } finally {
      setWorking(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: storm ? stormTypeLabel(storm.stormType) : 'Storm report',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text },
          headerShadowVisible: false,
        }}
      />
      {loading && storms.length === 0 ? (
        <LoadingSkeleton variant="detail" />
      ) : !storm ? (
        <EmptyState
          title="Not found"
          message="That storm report is not on this device."
          actionLabel="Back to log"
          onAction={() => router.replace('/storms')}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxxl }}>
          <Image
            source={{ uri: storm.photoUri }}
            style={[styles.photo, { borderRadius: radius.md, backgroundColor: colors.surfaceMuted }]}
            contentFit="cover"
            accessibilityLabel="Storm photo"
          />
          <Meta label="Storm type" value={stormTypeLabel(storm.stormType)} />
          <Meta label="Weather conditions" value={storm.weatherConditions} />
          <Meta label="Location" value={formatCoordinates(storm.latitude, storm.longitude)} />
          <Meta label="Date and time" value={formatDateTime(storm.capturedAt)} />
          <Meta label="Notes" value={storm.notes.length > 0 ? storm.notes : 'No notes'} />
          <Meta label="Saved" value={syncStatusLabel(storm.syncStatus)} />
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            {getCloudProvider().isConfigured()
              ? '☁️ Cloud sync sends report metadata only. The photo stays on this device.'
              : '☁️ Cloud sync is not configured. Reports stay on this device.'}
          </Text>
          {syncMessage ? <Text style={[typography.body, { color: scheme === 'dark' ? colors.warning : colors.text }]}>{syncMessage}</Text> : null}
          {getCloudProvider().isConfigured() ? (
            <PrimaryButton label="Sync metadata" variant="secondary" onPress={() => void onSync()} loading={working} />
          ) : null}
          <PrimaryButton label="Delete report" variant="danger" onPress={confirmDelete} disabled={working} />
        </ScrollView>
      )}
    </View>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  const { colors, typography } = useTheme();
  return (
    <View style={{ gap: 4 }}>
      <Text style={[typography.label, { color: colors.textMuted }]}>{label.toUpperCase()}</Text>
      <Text style={[typography.body, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: {
    width: '100%',
    height: 280,
  },
});
