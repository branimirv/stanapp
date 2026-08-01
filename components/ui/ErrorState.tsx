import { AlertCircle } from 'lucide-react-native';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/ui/AppButton';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function ErrorState({
  message,
  onRetry,
  retryLabel,
  style,
  className,
}: ErrorStateProps) {
  const { t } = useTranslation();

  const displayMessage = message ?? t('errors.loadFailed');
  const displayRetryLabel = retryLabel ?? t('common.retry');

  return (
    <View
      className={cn('flex-1 items-center justify-center px-8 py-12', className)}
      style={style}
    >
      <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
        <AlertCircle size={40} color={Colors.danger} strokeWidth={1.75} />
      </View>

      <Text className="mb-2 text-center text-lg font-semibold">{t('common.error')}</Text>

      <Text className="text-muted-foreground mb-2 text-center text-sm">{displayMessage}</Text>

      <Text className="text-muted-foreground mb-6 text-center text-xs">{t('errors.retryHint')}</Text>

      {onRetry ? (
        <AppButton mode="contained" onPress={onRetry} className="min-w-36">
          {displayRetryLabel}
        </AppButton>
      ) : null}
    </View>
  );
}
