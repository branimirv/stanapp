import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DisplayAmount } from '@/components/ui/DisplayAmount';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Typography } from '@/constants/theme';
import { displayFontFamily, Fonts } from '@/lib/fonts';
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
  const { colors } = theme;
  const resolvedLanguage = language ?? (i18n.language === 'en' ? 'en' : 'hr');

  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontFamily: displayFontFamily(theme.name),
          fontSize: Typography.display.sectionHead.size,
          lineHeight: Typography.display.sectionHead.lineHeight,
          letterSpacing: Typography.display.sectionHead.letterSpacing,
          color: colors.fg,
          marginBottom: 11,
        }}
      >
        {t('dashboard.recentActivity')}
      </Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.cardBd,
            borderRadius: theme.radius.xl,
            ...theme.elevation.card,
          },
        ]}
      >
        {items.length === 0 ? (
          <Text
            style={{
              fontFamily: Fonts.sans.regular,
              fontSize: Typography.text.listRow.size,
              color: colors.muted,
              paddingVertical: 8,
            }}
          >
            {t('dashboard.noRecentActivity')}
          </Text>
        ) : (
          items.map((item, index) => {
            const isIncome = item.type === 'rent_payment';
            const accentColor = isIncome ? colors.pos : colors.neg;
            const typeLabel = isIncome
              ? t('dashboard.activityRent')
              : t('dashboard.activityExpense');
            const detail = getItemDetail(item, t);
            const isLast = index === items.length - 1;

            const row = (
              <View
                style={[
                  styles.row,
                  !isLast && { borderBottomWidth: 1, borderBottomColor: colors.bd },
                ]}
              >
                <View style={styles.copy}>
                  <Text numberOfLines={1}>
                    <Text
                      style={{
                        fontFamily: Fonts.sans.semibold,
                        fontSize: Typography.text.listRow.size,
                        color: accentColor,
                      }}
                    >
                      {typeLabel}
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.sans.regular,
                        fontSize: Typography.text.listRow.size,
                        color: colors.muted,
                      }}
                    >
                      {' · '}
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.sans.semibold,
                        fontSize: Typography.text.listRow.size,
                        color: colors.fg,
                      }}
                    >
                      {detail}
                    </Text>
                  </Text>
                  <Text
                    style={{
                      fontFamily: Fonts.sans.regular,
                      fontSize: Typography.text.caption.size,
                      color: colors.muted,
                      marginTop: 3,
                    }}
                  >
                    {formatDate(item.created_at, resolvedLanguage)}
                  </Text>
                </View>

                <View style={styles.amount}>
                  <Text
                    style={{
                      fontFamily: Fonts.sans.semibold,
                      fontSize: Typography.text.chip.size,
                      color: accentColor,
                      marginRight: 2,
                    }}
                  >
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

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 18,
    paddingVertical: 4,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  amount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexShrink: 0,
  },
});
