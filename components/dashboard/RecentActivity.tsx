import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DisplayAmount } from '@/components/ui/DisplayAmount';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Typography } from '@/constants/theme';
import { displayFontFamily } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/formatters';
import type { Language, RecentActivityItem } from '@/types/app.types';

export interface RecentActivityProps {
  items: RecentActivityItem[];
  language?: Language;
  onItemPress?: (item: RecentActivityItem) => void;
}

function getItemDetail(
  item: RecentActivityItem,
  t: (key: string, options?: { defaultValue?: string }) => string,
) {
  if (item.type === 'expense') {
    return t(`categories.${item.title}`, { defaultValue: item.title });
  }
  return item.title;
}

/** Naslov recent activity — sechead + surface card with hairline rows. */
export function RecentActivity({ items, language = 'hr', onItemPress }: RecentActivityProps) {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const { colors, elevation } = theme;
  const resolvedLanguage = language ?? (i18n.language === 'en' ? 'en' : 'hr');

  return (
    <View className="mb-4">
      <Text
        className="text-fg mb-2.75 text-[22px] leading-6 tracking-[-0.55px]"
        style={{ fontFamily: displayFontFamily(theme.name) }}
      >
        {t('dashboard.recentActivity')}
      </Text>

      <View
        className="border-card-bd bg-surface rounded-xl border px-4.5 py-1"
        style={elevation.card}
      >
        {items.length === 0 ? (
          <Text className="text-muted py-2 text-[15px]">
            {t('dashboard.noRecentActivity')}
          </Text>
        ) : (
          items.map((item, index) => {
            const isIncome = item.type === 'rent_payment';
            const accentColor = isIncome ? colors.pos : colors.neg;
            const accentClass = isIncome ? 'text-pos' : 'text-neg';
            const typeLabel = isIncome
              ? t('dashboard.activityRent')
              : t('dashboard.activityExpense');
            const detail = getItemDetail(item, t);
            const isLast = index === items.length - 1;

            const row = (
              <View
                className={cn(
                  'flex-row items-center gap-3 py-3.25',
                  !isLast && 'border-bd border-b'
                )}
              >
                <View className="min-w-0 flex-1">
                  <Text numberOfLines={1}>
                    <Text className={cn('text-[15px] font-semibold', accentClass)}>
                      {typeLabel}
                    </Text>
                    <Text className="text-muted text-[15px]">{' · '}</Text>
                    <Text className="text-fg text-[15px] font-semibold">{detail}</Text>
                  </Text>
                  <Text className="text-muted mt-0.75 text-[12.5px]">
                    {formatDate(item.created_at, resolvedLanguage)}
                  </Text>
                </View>

                <View className="shrink-0 flex-row items-baseline">
                  <Text className={cn('mr-0.5 text-xs font-semibold', accentClass)}>
                    {isIncome ? '+' : '−'}
                  </Text>
                  <DisplayAmount
                    amount={item.amount}
                    currency={item.currency ?? 'EUR'}
                    language={resolvedLanguage}
                    size={Typography.display.listFigure.size}
                    lineHeight={Typography.display.listFigure.lineHeight}
                    letterSpacing={Typography.display.listFigure.letterSpacing}
                    color={accentColor}
                  />
                </View>
              </View>
            );

            if (onItemPress) {
              return (
                <Pressable
                  key={`${item.type}-${item.id}`}
                  onPress={() => onItemPress(item)}
                  accessibilityRole="button"
                >
                  {row}
                </Pressable>
              );
            }

            return <View key={`${item.type}-${item.id}`}>{row}</View>;
          })
        )}
      </View>
    </View>
  );
}
