import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { useTheme } from '@/theme/ThemeProvider';
import { themePreferenceLabel } from '@/theme/theme';

const POINTS = [
  { icon: '🌦️', label: 'Weather forecast' },
  { icon: '🗺️', label: 'Storm locations on map' },
  { icon: '📡', label: 'Offline support' },
  { icon: '🌙', label: 'Dark mode' },
  { icon: '💀', label: 'Loading screens' },
  { icon: '🔄', label: 'Pull to refresh' },
  { icon: '☁️', label: 'Cloud integration' },
];

export default function LaunchScreen() {
  const { colors, spacing, typography, radius, preference, cyclePreference } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.page, { backgroundColor: colors.background, paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl, paddingHorizontal: spacing.xl }]}>
      <View style={styles.top}>
        <View style={[styles.mark, { backgroundColor: colors.accent, borderRadius: radius.md }]}>
          <Text style={[typography.heading, { color: colors.accentText }]}>SC</Text>
        </View>
        <Text
          accessibilityRole="button"
          onPress={cyclePreference}
          style={[typography.label, { color: colors.textMuted }]}
        >
          {themePreferenceLabel(preference).toUpperCase()}
        </Text>
      </View>

      <View style={{ gap: spacing.md, marginTop: spacing.xxxl }}>
        <Text style={[typography.label, { color: colors.accent }]}>FIELD KIT</Text>
        <Text style={[typography.title, { color: colors.text, fontSize: 44, lineHeight: 48 }]}>Storm Chaser</Text>
        <Text style={[typography.body, { color: colors.textMuted, maxWidth: 340 }]}>
          Track the sky you are standing under, then keep a photo record of what the storm did.
        </Text>
      </View>

      <View style={[styles.features, { marginTop: spacing.xl, rowGap: spacing.sm }]}>
        {POINTS.map((point) => (
          <View
            key={point.label}
            style={[styles.feature, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}
          >
            <Text style={styles.featureIcon}>{point.icon}</Text>
            <Text style={[typography.caption, { color: colors.text, flex: 1 }]}>{point.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Open field kit" onPress={() => router.replace('/(tabs)')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mark: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    marginTop: 'auto',
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  feature: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  featureIcon: {
    fontSize: 18,
  },
});
