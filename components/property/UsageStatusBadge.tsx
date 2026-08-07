import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppBadge, type AppBadgeVariant } from '@/components/ui/AppBadge';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { UsageStatus } from '@/types/app.types';

const STATUS_VARIANTS: Record<UsageStatus, AppBadgeVariant> = {
  rented: 'success',
  personal_use: 'info',
  vacant: 'warning',
  in_renovation: 'default',
};

export interface UsageStatusBadgeProps {
  status: UsageStatus;
  onPress?: () => void;
}

export function UsageStatusBadge({ status, onPress }: UsageStatusBadgeProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const renovationColor = status === 'in_renovation' ? theme.colors.chart[5] : undefined;

  const badge = (
    <AppBadge
      label={t(`usageStatus.${status}`)}
      variant={STATUS_VARIANTS[status]}
      color={renovationColor}
    />
  );

  if (!onPress) return badge;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={t('properties.usageHistory')}
    >
      {badge}
    </Pressable>
  );
}
