import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type Variant = 'primary' | 'secondary' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: Props) {
  const { colors, radius, typography } = useTheme();
  const isDisabled = disabled || loading;
  const background =
    variant === 'primary' ? colors.accent : variant === 'danger' ? colors.danger : colors.surface;
  const textColor =
    variant === 'secondary' ? colors.text : variant === 'danger' ? '#FFFDF8' : colors.accentText;
  const borderColor = variant === 'secondary' ? colors.border : background;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: background,
          borderColor,
          borderRadius: radius.md,
          opacity: isDisabled ? 0.55 : pressed ? 0.82 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[typography.heading, styles.label, { color: textColor, fontSize: 16 }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  label: {
    textAlign: 'center',
  },
});
