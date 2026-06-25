import { AlertCircle } from 'lucide-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { AppButton } from '@/components/ui/AppButton';

export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function ErrorState({
  message,
  onRetry,
  retryLabel,
  style,
}: ErrorStateProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const displayMessage = message ?? t('errors.loadFailed');
  const displayRetryLabel = retryLabel ?? t('common.retry');

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: theme.dark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2' },
        ]}
      >
        <AlertCircle size={40} color={Colors.danger} strokeWidth={1.75} />
      </View>

      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        {t('common.error')}
      </Text>

      <Text style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
        {displayMessage}
      </Text>

      <Text style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
        {t('errors.retryHint')}
      </Text>

      {onRetry ? (
        <AppButton mode="contained" onPress={onRetry} style={styles.retry}>
          {displayRetryLabel}
        </AppButton>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.titleLarge,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    ...Typography.bodyMedium,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  hint: {
    ...Typography.bodySmall,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retry: {
    minWidth: 140,
  },
});
