import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Typography } from '@/constants/theme';
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
  const theme = useTheme();
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
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
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
              style={[
                styles.cell,
                {
                  backgroundColor: theme.dark ? Colors.surfaceDark : Colors.surface,
                  borderColor: theme.colors.outline,
                },
              ]}
              onPress={() => onMonthPress?.(month, payment)}
              disabled={!onMonthPress}
              accessibilityRole="button"
              accessibilityLabel={`${formatPeriodShort(month, year, resolvedLanguage)} — ${label}`}
            >
              <Text style={[styles.monthLabel, { color: theme.colors.onSurfaceVariant }]}>
                {formatPeriodShort(month, year, resolvedLanguage)}
              </Text>
              <View style={[styles.statusDot, { backgroundColor: color }]} />
              <Text style={[styles.statusLabel, { color }]} numberOfLines={1}>
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
  title: {
    ...Typography.titleMedium,
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
  monthLabel: {
    ...Typography.labelMedium,
    textAlign: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusLabel: {
    ...Typography.labelSmall,
    textAlign: 'center',
  },
});
