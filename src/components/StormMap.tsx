import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { buildStormMapHtml, coordinateBounds, type MapPoint } from '@/features/storms/storm.utils';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  points: MapPoint[];
  online: boolean;
  onSelect: (id: string) => void;
};

export function StormMap({ points, online, onSelect }: Props) {
  const { colors, radius, typography } = useTheme();
  const [webFailed, setWebFailed] = useState(false);
  const html = useMemo(() => buildStormMapHtml(points), [points]);
  const showTiles = online && !webFailed;

  if (!showTiles) {
    return <CoordinatePlot points={points} onSelect={onSelect} />;
  }

  return (
    <View style={[styles.map, { borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.web}
        onError={() => setWebFailed(true)}
        onHttpError={() => setWebFailed(true)}
        onMessage={(event) => {
          const id = event.nativeEvent.data;
          if (id) {
            onSelect(id);
          }
        }}
      />
      <Text style={[typography.caption, styles.attribution, { color: colors.textMuted }]}>
        Map data © OpenStreetMap contributors
      </Text>
    </View>
  );
}

function CoordinatePlot({ points, onSelect }: { points: MapPoint[]; onSelect: (id: string) => void }) {
  const { colors, radius, typography } = useTheme();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const bounds = coordinateBounds(points);
  const latSpan = Math.max(bounds.maxLat - bounds.minLat, 0.2);
  const lonSpan = Math.max(bounds.maxLon - bounds.minLon, 0.2);

  return (
    <View
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setSize({ width, height });
      }}
      style={[styles.map, styles.plot, { backgroundColor: colors.surfaceMuted, borderColor: colors.border, borderRadius: radius.md }]}
    >
      <Text style={[typography.caption, { color: colors.textMuted }]}>Saved positions · tiles unavailable</Text>
      {size.width > 0
        ? points.map((point) => {
            const x = ((point.longitude - (bounds.minLon - lonSpan * 0.15)) / (lonSpan * 1.3)) * size.width;
            const y = ((bounds.maxLat + latSpan * 0.15 - point.latitude) / (latSpan * 1.3)) * (size.height - 28);
            return (
              <Pressable
                key={point.id}
                accessibilityRole="button"
                accessibilityLabel={point.label}
                onPress={() => onSelect(point.id)}
                style={[styles.marker, { left: x - 8, top: y + 12, backgroundColor: colors.accent }]}
              >
                <Text style={[typography.caption, styles.markerLabel, { color: colors.text }]} numberOfLines={1}>
                  {point.label}
                </Text>
              </Pressable>
            );
          })
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    minHeight: 280,
    overflow: 'hidden',
    borderWidth: 1,
  },
  web: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  plot: {
    padding: 12,
  },
  attribution: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  marker: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  markerLabel: {
    position: 'absolute',
    left: 20,
    top: -2,
    width: 120,
  },
});
