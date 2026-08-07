import { CircleCheck } from 'lucide-react-native';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily } from '@/lib/fonts';
import { cn } from '@/lib/utils';
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
      className="items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
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
  const { colors, elevation } = theme;
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
      className="border-card-bd bg-surface mb-4.5 rounded-xl border px-4 pt-4.5 pb-4"
      style={elevation.card}
    >
      <View className="mb-0.5 flex-row items-baseline justify-between">
        <Text
          className="text-fg text-[19px] tracking-[-0.4px]"
          style={{ fontFamily: displayFontFamily(theme.name) }}
        >
          {t('rent.monthlyGrid')}
        </Text>
        <Text className="text-muted text-[11px] font-semibold tracking-[1.1px] uppercase">
          {year}
        </Text>
      </View>

      <View className="mt-3 flex-row flex-wrap gap-x-4 gap-y-2">
        {LEGEND_STATUSES.map((status) => (
          <View key={status} className="flex-row items-center gap-1.5">
            <StatDot status={status} />
            <Text className="text-muted text-[11.5px]">{t(statusLabelKey(status))}</Text>
          </View>
        ))}
      </View>

      <View className="mt-4 flex-row flex-wrap gap-2">
        {months.map(({ month, payment }) => {
          const status: GridStatus = payment?.status ?? 'empty';
          const label = t(statusLabelKey(status));
          const monthName = monthLabel(month, year, resolvedLanguage);
          const isCurrent = month === currentMonth && year === currentYear;

          return (
            <Pressable
              key={month}
              className={cn(
                'bg-surface-2 items-center rounded-lg pt-3.25 pb-3',
                isCurrent ? 'border-primary' : 'border-transparent',
              )}
              style={({ pressed }) => [
                {
                  width: cellWidth,
                  borderWidth: 1.5,
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
                className="text-fg mb-2.5 px-1 text-center text-xs font-semibold"
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
