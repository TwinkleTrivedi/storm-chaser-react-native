import { Pressable, StyleSheet, Text, View } from 'react-native';

import { themePreferenceLabel } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  title: string;
  subtitle?: string;
};

export function ScreenHeader({ title, subtitle }: Props) {
  const { colors, spacing, typography, preference, cyclePreference, radius } = useTheme();

  return (
    <View style={[styles.row, { paddingHorizontal: spacing.xl, paddingBottom: spacing.md, gap: spacing.md }]}>
      <View style={styles.copy}>
        <Text style={[typography.title, { color: colors.text, fontSize: 30 }]}>{title}</Text>
        {subtitle ? (
          <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>{subtitle}</Text>
        ) : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Theme ${themePreferenceLabel(preference)}. Activate to change.`}
        onPress={cyclePreference}
        style={({ pressed }) => [
          styles.theme,
          {
            borderColor: colors.border,
            backgroundColor: pressed ? colors.surfaceMuted : colors.surface,
            borderRadius: radius.pill,
          },
        ]}
      >
        <Text style={[typography.label, { color: colors.text }]}>🌙 {themePreferenceLabel(preference)}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
  },
  theme: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
