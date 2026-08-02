import {
  Circle,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  Clock3,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Colors, Spacing } from '@/constants/theme';
import { formatMonthNameShort } from '@/utils/formatters';
import type { Language, PaymentStatus, RentPayment } from '@/types/app.types';

type GridStatus = PaymentStatus | 'empty';

const STATUS_COLORS: Record<GridStatus, string> = {
  paid: Colors.statusPaid,
  pending: Colors.statusPending,
  late: Colors.statusLate,
  partial: Colors.statusPartial,
  empty: Colors.textDisabled,
};

const STATUS_ICONS: Record<GridStatus, LucideIcon> = {
  paid: CircleCheck,
  pending: Clock3,
  late: CircleAlert,
  partial: CircleDashed,
  empty: Circle,
};

const LEGEND_STATUSES: GridStatus[] = ['paid', 'pending', 'late', 'partial', 'empty'];

export interface MonthlyGridProps {
  year: number;
  payments: RentPayment[];
  language?: Language;
  onMonthPress?: (month: number, payment?: RentPayment) => void;
}

function statusLabelKey(status: GridStatus): string {
  if (status === 'empty') return 'rent.monthNoRecord';
  return `rent.${status}`;
}

export function MonthlyGrid({ year, payments, language = 'hr', onMonthPress }: MonthlyGridProps) {
  const { isDark } = useAppTheme();
  const { t, i18n } = useTranslation();
  const resolvedLanguage = language ?? (i18n.language === 'en' ? 'en' : 'hr');

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const months = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const payment = payments.find(
      (item) => item.period_month === month && item.period_year === year,
    );
    return { month, payment };
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text className="text-foreground text-base font-bold">{t('rent.monthlyGrid')}</Text>
        <Text className="text-muted-foreground text-sm font-medium">{year}</Text>
      </View>

      <View style={styles.legend}>
        {LEGEND_STATUSES.map((status) => {
          const color = STATUS_COLORS[status];
          const StatusIcon = STATUS_ICONS[status];
          return (
            <View key={status} style={styles.legendItem}>
              <StatusIcon size={12} color={color} strokeWidth={2} />
              <Text className="text-muted-foreground text-[11px]">{t(statusLabelKey(status))}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.grid}>
        {months.map(({ month, payment }) => {
          const status: GridStatus = payment?.status ?? 'empty';
          const color = STATUS_COLORS[status];
          const StatusIcon = STATUS_ICONS[status];
          const label = t(statusLabelKey(status));
          const monthName = formatMonthNameShort(month, year, resolvedLanguage);
          const isCurrent = month === currentMonth && year === currentYear;
          const surface = isDark ? Colors.surfaceDark : Colors.surface;
          const tintedBg = status === 'empty' ? surface : `${color}14`;

          return (
            <Pressable
              key={month}
              style={({ pressed }) => [
                styles.cell,
                {
                  backgroundColor: tintedBg,
                  borderColor: isCurrent ? Colors.primary : isDark ? Colors.borderDark : Colors.border,
                  borderWidth: isCurrent ? 2 : 1,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={() => onMonthPress?.(month, payment)}
              disabled={!onMonthPress}
              accessibilityRole="button"
              accessibilityLabel={`${monthName} — ${label}`}
              accessibilityState={{ selected: isCurrent }}
            >
              <Text className="text-foreground text-center text-xs font-semibold">{monthName}</Text>
              <StatusIcon size={20} color={color} strokeWidth={2} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    padding: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  cell: {
    flexBasis: '30%',
    flexGrow: 1,
    minHeight: 64,
    borderRadius: 12,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
