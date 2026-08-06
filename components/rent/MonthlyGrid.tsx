import { CircleCheck } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily, Fonts } from '@/lib/fonts';
import { formatMonthName } from '@/utils/formatters';
import type { Language, PaymentStatus, RentPayment } from '@/types/app.types';

type GridStatus = PaymentStatus | 'empty';

const LEGEND_STATUSES: GridStatus[] = ['paid', 'pending', 'late', 'partial', 'empty'];
const CELL_GAP = 8;
const CARD_PAD = 16;

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

function monthLabel(month: number, year: number, language: Language): string {
  const name = formatMonthName(month, year, language).replace(/\.$/, '');
  return name.charAt(0).toLocaleUpperCase(language === 'en' ? 'en' : 'hr') + name.slice(1);
}

/** Naslov `.stat-dot` — tinted fill / outline / dashed / check for paid. */
function StatDot({
  status,
  large = false,
}: {
  status: GridStatus;
  large?: boolean;
}) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const size = large ? 22 : 16;
  const iconSize = large ? 12 : 9;

  let backgroundColor = 'transparent';
  let borderColor = colors.bdStrong;
  let borderStyle: 'solid' | 'dashed' = 'solid';
  let iconColor: string | null = null;

  switch (status) {
    case 'paid':
      backgroundColor = colors.posTint;
      borderColor = 'transparent';
      iconColor = colors.pos;
      break;
    case 'pending':
      backgroundColor = colors.primaryTint;
      borderColor = 'transparent';
      break;
    case 'late':
      backgroundColor = colors.negTint;
      borderColor = 'transparent';
      break;
    case 'partial':
      borderStyle = 'dashed';
      break;
    case 'empty':
    default:
      break;
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor,
        borderWidth: 1.5,
        borderColor,
        borderStyle,
      }}
    >
      {iconColor ? <CircleCheck size={iconSize} color={iconColor} strokeWidth={2.5} /> : null}
    </View>
  );
}

/**
 * Naslov monthly rent calendar — sechead + legend + 3×4 `.mcal` cells.
 */
export function MonthlyGrid({ year, payments, language = 'hr', onMonthPress }: MonthlyGridProps) {
  const { theme } = useAppTheme();
  const { colors, elevation, radius } = theme;
  const { t, i18n } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const resolvedLanguage = language ?? (i18n.language === 'en' ? 'en' : 'hr');

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const contentWidth = windowWidth - Spacing.gutter * 2 - CARD_PAD * 2;
  const cellWidth = Math.floor((contentWidth - CELL_GAP * 2) / 3);

  const months = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const payment = payments.find(
      (item) => item.period_month === month && item.period_year === year,
    );
    return { month, payment };
  });

  return (
    <View
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
      <View style={styles.header}>
        <Text
          style={{
            fontFamily: displayFontFamily(theme.name),
            fontSize: 19,
            letterSpacing: -0.4,
            color: colors.fg,
          }}
        >
          {t('rent.monthlyGrid')}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.sans.semibold,
            fontSize: 11,
            letterSpacing: 1.1,
            textTransform: 'uppercase',
            color: colors.muted,
          }}
        >
          {year}
        </Text>
      </View>

      <View style={styles.legend}>
        {LEGEND_STATUSES.map((status) => (
          <View key={status} style={styles.legendItem}>
            <StatDot status={status} />
            <Text
              style={{
                fontFamily: Fonts.sans.regular,
                fontSize: 11.5,
                color: colors.muted,
              }}
            >
              {t(statusLabelKey(status))}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {months.map(({ month, payment }) => {
          const status: GridStatus = payment?.status ?? 'empty';
          const label = t(statusLabelKey(status));
          const monthName = monthLabel(month, year, resolvedLanguage);
          const isCurrent = month === currentMonth && year === currentYear;

          return (
            <Pressable
              key={month}
              style={({ pressed }) => [
                styles.cell,
                {
                  width: cellWidth,
                  backgroundColor: colors.surface2,
                  borderColor: isCurrent ? colors.primary : 'transparent',
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
              onPress={() => onMonthPress?.(month, payment)}
              disabled={!onMonthPress}
              accessibilityRole="button"
              accessibilityLabel={`${monthName} — ${label}`}
              accessibilityState={{ selected: isCurrent }}
            >
              <Text
                style={{
                  fontFamily: Fonts.sans.semibold,
                  fontSize: 12,
                  color: colors.fg,
                  marginBottom: 10,
                  textAlign: 'center',
                  paddingHorizontal: 4,
                }}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {monthName}
              </Text>
              <StatDot status={status} large />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    paddingHorizontal: CARD_PAD,
    paddingTop: 18,
    paddingBottom: 16,
    marginBottom: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
    columnGap: 16,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CELL_GAP,
    marginTop: 16,
  },
  cell: {
    borderRadius: 16,
    paddingTop: 13,
    paddingBottom: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
});
