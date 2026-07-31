import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppBadge, type AppBadgeVariant } from '@/components/ui/AppBadge';
import { Colors } from '@/constants/theme';
import type { UsageStatus } from '@/types/app.types';

const STATUS_VARIANTS: Record<UsageStatus, AppBadgeVariant> = {
  rented: 'success',
  personal_use: 'info',
  vacant: 'warning',
  in_renovation: 'default',
};

const STATUS_COLORS: Partial<Record<UsageStatus, string>> = {
  in_renovation: Colors.statusPartial,
};

export interface UsageStatusBadgeProps {
  status: UsageStatus;
  onPress?: () => void;
}

export function UsageStatusBadge({ status, onPress }: UsageStatusBadgeProps) {
  const { t } = useTranslation();

  const badge = (
    <AppBadge
      label={t(`usageStatus.${status}`)}
      variant={STATUS_VARIANTS[status]}
      color={STATUS_COLORS[status]}
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
