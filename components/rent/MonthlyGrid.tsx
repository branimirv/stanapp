import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Colors, Spacing } from '@/constants/theme';
import { formatPeriodShort } from '@/utils/formatters';
import type { Language, PaymentStatus, RentPayment } from '@/types/app.types';

const STATUS_COLORS: Record<PaymentStatus | 'empty', string> = {
  paid: Colors.statusPaid,
  pending: Colors.statusPending,
  late: Colors.statusLate,
  partial: Colors.statusPartial,
  empty: Colors.border,
};

export interface MonthlyGridProps {
  year: number;
  payments: RentPayment[];
  language?: Language;
  onMonthPress?: (month: number, payment?: RentPayment) => void;
}

export function MonthlyGrid({ year, payments, language = 'hr', onMonthPress }: MonthlyGridProps) {
  const { isDark } = useAppTheme();
  const { t, i18n } = useTranslation();
  const resolvedLanguage = language ?? (i18n.language === 'en' ? 'en' : 'hr');

  const months = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const payment = payments.find(
      (item) => item.period_month === month && item.period_year === year,
    );
    return { month, payment };
  });

  return (
    <View style={styles.container}>
      <Text className="text-lg font-medium">
        {t('rent.monthlyGrid')} — {year}
      </Text>

      <View style={styles.grid}>
        {months.map(({ month, payment }) => {
          const status = payment?.status ?? 'empty';
          const color = STATUS_COLORS[status];
          const label = payment
            ? t(`rent.${payment.status}`)
            : t('rent.monthEmpty');

          return (
            <Pressable
              key={month}
              style={[styles.cell, { backgroundColor: isDark ? Colors.surfaceDark : Colors.surface }]}
              className="border-border"
              onPress={() => onMonthPress?.(month, payment)}
              disabled={!onMonthPress}
              accessibilityRole="button"
              accessibilityLabel={`${formatPeriodShort(month, year, resolvedLanguage)} — ${label}`}
            >
              <Text className="text-muted-foreground text-center text-xs font-medium">
                {formatPeriodShort(month, year, resolvedLanguage)}
              </Text>
              <View style={[styles.statusDot, { backgroundColor: color }]} />
              <Text className="text-center text-[11px]" style={{ color }} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  cell: {
    width: '31%',
    minWidth: 96,
    flexGrow: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
