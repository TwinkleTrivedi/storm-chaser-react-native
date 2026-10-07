import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StormCard } from '@/components/StormCard';
import { StormMap } from '@/components/StormMap';
import { stormTypeLabel } from '@/features/storms/storm.utils';
import { useOnline } from '@/hooks/useOnline';
import { useStorms } from '@/hooks/useStorms';
import { useTheme } from '@/theme/ThemeProvider';

export default function MapScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const online = useOnline();
  const { storms, loading } = useStorms();

  const points = storms.map((storm) => ({
    id: storm.id,
    latitude: storm.latitude,
    longitude: storm.longitude,
    label: stormTypeLabel(storm.stormType),
  }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + spacing.sm }}>
      <ScreenHeader title="🗺️ Chase map" subtitle={online ? 'OpenStreetMap' : '📡 Offline positions'} />
      {loading && storms.length === 0 ? (
        <LoadingSkeleton variant="list" />
      ) : storms.length === 0 ? (
        <EmptyState
          title="No positions yet"
          message="Document a storm and it will show up here."
          actionLabel="Document a storm"
          onAction={() => router.navigate('/document')}
        />
      ) : (
        <View style={{ flex: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, gap: spacing.md }}>
          <StormMap points={points} online={online} onSelect={(id) => router.push(`/storm/${id}`)} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
            {storms.map((storm) => (
              <StormCard key={storm.id} storm={storm} compact onPress={() => router.push(`/storm/${storm.id}`)} />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
