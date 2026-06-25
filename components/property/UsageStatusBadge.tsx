import { useTranslation } from 'react-i18next';
import { AppBadge, type AppBadgeVariant } from '@/components/ui/AppBadge';
import type { UsageStatus } from '@/types/app.types';

const STATUS_VARIANTS: Record<UsageStatus, AppBadgeVariant> = {
  rented: 'success',
  personal_use: 'info',
  vacant: 'warning',
};

export interface UsageStatusBadgeProps {
  status: UsageStatus;
}

export function UsageStatusBadge({ status }: UsageStatusBadgeProps) {
  const { t } = useTranslation();
  return (
    <AppBadge label={t(`usageStatus.${status}`)} variant={STATUS_VARIANTS[status]} />
  );
}
