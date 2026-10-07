import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  title: string;
  condition: string;
  primary: string;
  secondary: string;
};

export function ForecastCard({ title, condition, primary, secondary }: Props) {
  const { colors, radius, typography } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md },
      ]}
    >
      <Text style={[typography.label, { color: colors.textMuted }]}>{title.toUpperCase()}</Text>
      <Text style={[typography.heading, { color: colors.text, marginTop: 8 }]}>{primary}</Text>
      <Text style={[typography.caption, { color: colors.text, marginTop: 4 }]} numberOfLines={2}>
        {condition}
      </Text>
      <Text style={[typography.caption, { color: colors.textMuted, marginTop: 6 }]}>{secondary}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 148,
    minHeight: 132,
    padding: 14,
    borderWidth: 1,
  },
});
