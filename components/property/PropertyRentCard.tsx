import { differenceInCalendarDays, format, startOfDay } from 'date-fns';
import { Clock3 } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DisplayAmount } from '@/components/ui/DisplayAmount';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Fonts } from '@/lib/fonts';
import type { Language, RentPayment } from '@/types/app.types';
import { formatDate, formatMonthName } from '@/utils/formatters';

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
  const { colors, elevation, radius } = theme;

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
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.cardBd,
          borderRadius: radius.xl,
          ...elevation.card,
        },
      ]}
    >
      <Text
        style={{
          fontFamily: Fonts.sans.semibold,
          fontSize: 11,
          letterSpacing: 1.54,
          textTransform: 'uppercase',
          color: colors.muted,
          marginBottom: 11,
        }}
      >
        {t('properties.rentMonthlyLab')}
      </Text>

      <DisplayAmount
        amount={rentAmount}
        currency={currency}
        language={language}
        size={46}
      />

      <View style={styles.foot}>
        {isPaid ? (
          <View style={[styles.chip, { backgroundColor: colors.posTint }]}>
            <Text
              style={{
                fontFamily: Fonts.sans.semibold,
                fontSize: 11,
                color: colors.pos,
              }}
            >
              {t('rent.paid')}
            </Text>
          </View>
        ) : (
          <>
            <View style={[styles.chip, { backgroundColor: colors.primaryTint }]}>
              <Clock3 size={12} color={colors.primary} strokeWidth={2} />
              <Text
                style={{
                  fontFamily: Fonts.sans.semibold,
                  fontSize: 11,
                  color: colors.primary,
                }}
              >
                {daysUntilDue >= 0
                  ? t('properties.dueInDays', { count: daysUntilDue })
                  : t('properties.overdueByDays', { count: Math.abs(daysUntilDue) })}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: Fonts.sans.semibold,
                fontSize: 10,
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                color: colors.muted,
              }}
            >
              {t('properties.dueOn', { date: dueLabel })}
            </Text>
          </>
        )}
        {payment?.payment_date && isPaid ? (
          <Text
            style={{
              fontFamily: Fonts.sans.semibold,
              fontSize: 10,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: colors.muted,
            }}
          >
            {formatDate(payment.payment_date, language)}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 18,
    borderWidth: 1,
    marginBottom: 10,
  },
  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 9,
    marginTop: 14,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 999,
  },
});
