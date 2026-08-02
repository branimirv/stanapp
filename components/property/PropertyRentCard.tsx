import {
  CircleAlert,
  CircleCheck,
  CircleDashed,
  Clock3,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { Language, PaymentStatus, RentPayment } from '@/types/app.types';
import { formatCurrencyShort, formatMonthName, getStatusColor } from '@/utils/formatters';

const STATUS_ICONS: Record<PaymentStatus, LucideIcon> = {
  paid: CircleCheck,
  pending: Clock3,
  late: CircleAlert,
  partial: CircleDashed,
};

export interface PropertyRentCardProps {
  rentAmount: number;
  currency: string;
  language: Language;
  month: number;
  year: number;
  payment?: RentPayment;
  onStatusPress: () => void;
  className?: string;
}

export function PropertyRentCard({
  rentAmount,
  currency,
  language,
  month,
  year,
  payment,
  onStatusPress,
  className,
}: PropertyRentCardProps) {
  const { t } = useTranslation();

  const statusLabel = payment ? t(`rent.${payment.status}`) : t('rent.monthEmpty');
  const statusVariant: PaymentStatus = payment?.status ?? 'pending';
  const StatusIcon = STATUS_ICONS[statusVariant];

  return (
    <Pressable
      className={cn(
        'bg-muted/60 min-h-[140px] flex-1 items-center justify-between rounded-[28px] px-3 py-4',
        className,
      )}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      onPress={onStatusPress}
      accessibilityRole="button"
      accessibilityLabel={`${t('properties.currentRentStatus', {
        month: formatMonthName(month, year, language),
      })}: ${statusLabel}`}
    >
      <Text
        className="text-muted-foreground text-center text-[10px] font-semibold tracking-wide uppercase"
        numberOfLines={1}
      >
        {t('properties.rentLabel')}
      </Text>

      <View className="items-center justify-center py-2">
        <StatusIcon size={22} color={getStatusColor(statusVariant)} strokeWidth={2} />
      </View>

      <Text
        className="text-foreground text-center text-[13px] font-semibold"
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {formatCurrencyShort(rentAmount, currency, language)}
        <Text className="text-muted-foreground text-[11px] font-medium">
          {' '}
          {t('properties.perMonthSuffix')}
        </Text>
      </Text>
    </Pressable>
  );
}
