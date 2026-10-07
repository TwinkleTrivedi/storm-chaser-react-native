import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StormCard } from '@/components/StormCard';
import { useStorms } from '@/hooks/useStorms';
import { useTheme } from '@/theme/ThemeProvider';

export default function StormsScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { storms, loading, error, refresh } = useStorms();
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }

  let body = null;
  if (loading && storms.length === 0) {
    body = <LoadingSkeleton variant="list" />;
  } else if (error && storms.length === 0) {
    body = <EmptyState title="Could not load reports" message={error} actionLabel="Try again" onAction={() => void refresh()} />;
  } else if (storms.length === 0) {
    body = (
      <EmptyState
        title="No storms yet"
        message="Capture a photo from the Document tab. Reports stay on this device."
        actionLabel="Document a storm"
        onAction={() => router.navigate('/document')}
      />
    );
  } else {
    body = (
      <FlatList
        data={storms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={colors.accent} colors={[colors.accent]} />
        }
        renderItem={({ item }) => (
          <StormCard storm={item} onPress={() => router.push(`/storm/${item.id}`)} />
        )}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + spacing.sm }}>
      <ScreenHeader title="Storm log" subtitle={`${storms.length} saved · 🔄 Pull to refresh`} />
      {body}
    </View>
  );
}
