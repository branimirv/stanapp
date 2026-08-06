import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CategoryBadge } from '@/components/expense/CategoryBadge';
import { DisplayAmount } from '@/components/ui/DisplayAmount';
import { EmptyState } from '@/components/ui/EmptyState';
import { Typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily, Fonts } from '@/lib/fonts';
import type { CategoryBreakdown, Language } from '@/types/app.types';

export interface ExpenseBreakdownProps {
  data: CategoryBreakdown[];
  currency?: string;
  language?: Language;
  style?: StyleProp<ViewStyle>;
}

/** Naslov “Troškovi po kategorijama” — total + segbar + category rows. */
export function ExpenseBreakdown({
  data,
  currency = 'EUR',
  language = 'hr',
  style,
}: ExpenseBreakdownProps) {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const { colors, elevation, radius } = theme;
  const resolvedLanguage = language ?? (i18n.language === 'en' ? 'en' : 'hr');
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  if (data.length === 0 || total <= 0) {
    return (
      <EmptyState
        title={t('reports.noData')}
        subtitle={t('reports.noDataHint')}
        style={styles.empty}
      />
    );
  }

  return (
    <View style={style}>
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
        {t('reports.expenseBreakdown')}
      </Text>

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
        <Text
          style={{
            fontFamily: Fonts.sans.semibold,
            fontSize: Typography.eyebrow.sm.size,
            letterSpacing: Typography.eyebrow.sm.letterSpacing,
            textTransform: 'uppercase',
            color: colors.muted,
            marginBottom: 9,
          }}
        >
          {t('common.total')}
        </Text>
        <DisplayAmount
          amount={total}
          currency={currency}
          language={resolvedLanguage}
          size={Typography.display.amountMd.size}
          lineHeight={Typography.display.amountMd.lineHeight}
          letterSpacing={Typography.display.amountMd.letterSpacing}
          style={styles.total}
        />

        <View style={styles.segbar}>
          {data.map((item) => (
            <View
              key={item.categoryId}
              style={{
                width: `${Math.max(item.percentage, 0.5)}%`,
                backgroundColor: item.color,
                height: '100%',
              }}
            />
          ))}
        </View>

        {data.map((item) => (
          <View key={item.categoryId} style={styles.catrow}>
            <CategoryBadge
              categoryKey={item.categoryKey}
              categoryName={item.categoryName}
              icon={item.icon}
              color={item.color}
            />
            <View style={styles.camt}>
              <DisplayAmount
                amount={item.amount}
                currency={currency}
                language={resolvedLanguage}
                size={Typography.display.listFigure.size}
                lineHeight={Typography.display.listFigure.lineHeight}
                letterSpacing={Typography.display.listFigure.letterSpacing}
              />
              <Text
                style={{
                  fontFamily: Fonts.sans.regular,
                  fontSize: Typography.text.catShare.size,
                  color: colors.muted,
                  marginTop: 2,
                }}
              >
                {t('reports.categoryShare')}: {item.percentage.toFixed(1)}%
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  total: {
    marginBottom: 14,
  },
  segbar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 8,
  },
  catrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
  },
  camt: {
    alignItems: 'flex-end',
  },
  empty: {
    paddingVertical: 24,
  },
});
