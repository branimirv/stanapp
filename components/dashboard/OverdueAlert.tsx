import { useTranslation } from 'react-i18next';
import { AlertBanner, type AlertBannerProps } from '@/components/dashboard/AlertBanner';

export interface OverdueAlertProps {
  count: number;
  onPress?: () => void;
}

export function OverdueAlert({ count, onPress }: OverdueAlertProps) {
  const { t } = useTranslation();

  if (count <= 0) {
    return null;
  }

  const props: AlertBannerProps = {
    variant: 'danger',
    title: t('dashboard.overdueCount', { count }),
    message: t('dashboard.overdueAlert'),
    actionLabel: onPress ? t('dashboard.viewOverdue') : undefined,
    onPress,
  };

  return <AlertBanner {...props} />;
}
