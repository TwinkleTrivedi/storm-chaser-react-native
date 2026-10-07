import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
};

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: Props) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={[styles.wrap, { padding: spacing.xl, gap: spacing.md }]}>
      <Text style={[typography.title, { color: colors.text, fontSize: 28 }]}>{title}</Text>
      <Text style={[typography.body, { color: colors.textMuted }]}>{message}</Text>
      {actionLabel && onAction ? <PrimaryButton label={actionLabel} onPress={onAction} /> : null}
      {secondaryActionLabel && onSecondaryAction ? (
        <PrimaryButton label={secondaryActionLabel} onPress={onSecondaryAction} variant="secondary" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
  },
});
