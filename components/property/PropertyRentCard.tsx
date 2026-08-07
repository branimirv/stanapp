import { differenceInCalendarDays, format, startOfDay } from 'date-fns';
import { Clock3 } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DisplayAmount } from '@/components/ui/DisplayAmount';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatDate, formatMonthName } from '@/utils/formatters';
import type { Language, RentPayment } from '@/types/app.types';

export interface PropertyRentCardProps {
  rentAmount: number;
  currency: string;
  language: Language;
  month: number;
  year: number;
  payment?: RentPayment;
  onStatusPress: () => void;
}

/** Conventional due: 1st of the following month for the billed period. */
function periodDueDate(month: number, year: number): Date {
  if (month === 12) return new Date(year + 1, 0, 1);
  return new Date(year, month, 1);
}

/**
 * Naslov overview rent card — lab + DisplayAmount hero + due/paid chip row.
 */
export function PropertyRentCard({
  rentAmount,
  currency,
  language,
  month,
  year,
  payment,
  onStatusPress,
}: PropertyRentCardProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors, elevation } = theme;

  const isPaid = payment?.status === 'paid';
  const dueDate = periodDueDate(month, year);
  const today = startOfDay(new Date());
  const daysUntilDue = differenceInCalendarDays(dueDate, today);
  const dueLabel = format(dueDate, 'dd.MM');

  return (
    <Pressable
      onPress={onStatusPress}
      accessibilityRole="button"
      accessibilityLabel={`${t('properties.currentRentStatus', {
        month: formatMonthName(month, year, language),
      })}`}
      className="border-card-bd bg-surface mb-2.5 rounded-xl border px-4.5 pt-5 pb-4.5"
      style={elevation.card}
    >
      <Text className="text-muted mb-2.75 text-[11px] font-semibold tracking-[1.54px] uppercase">
        {t('properties.rentMonthlyLab')}
      </Text>

      <DisplayAmount amount={rentAmount} currency={currency} language={language} size={46} />

      <View className="mt-3.5 flex-row flex-wrap items-center gap-2.25">
        {isPaid ? (
          <View className="bg-pos-tint flex-row items-center gap-1.5 rounded-full px-2.75 py-1.25">
            <Text className="text-pos text-[11px] font-semibold">{t('rent.paid')}</Text>
          </View>
        ) : (
          <>
            <View className="bg-primary-tint flex-row items-center gap-1.5 rounded-full px-2.75 py-1.25">
              <Clock3 size={12} color={colors.primary} strokeWidth={2} />
              <Text className="text-primary text-[11px] font-semibold">
                {daysUntilDue >= 0
                  ? t('properties.dueInDays', { count: daysUntilDue })
                  : t('properties.overdueByDays', { count: Math.abs(daysUntilDue) })}
              </Text>
            </View>
            <Text className="text-muted text-[10px] font-semibold tracking-[0.8px] uppercase">
              {t('properties.dueOn', { date: dueLabel })}
            </Text>
          </>
        )}
        {payment?.payment_date && isPaid ? (
          <Text className="text-muted text-[10px] font-semibold tracking-[0.8px] uppercase">
            {formatDate(payment.payment_date, language)}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
