import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DisplayAmount, formatDisplayNumber } from '@/components/ui/DisplayAmount';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Typography } from '@/constants/theme';
import { displayFontFamily, Fonts } from '@/lib/fonts';
import type { Language } from '@/types/app.types';

export interface RentCollectionCardProps {
  collected: number;
  expected: number;
  currency: string;
  language?: Language;
  /** Paid units / expected units — omit count clause when missing. */
  paidCount?: number;
  expectedCount?: number;
  onPress?: () => void;
}

export function RentCollectionCard({
  collected,
  expected,
  currency,
  language = 'hr',
  paidCount,
  expectedCount,
  onPress,
}: RentCollectionCardProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors } = theme;

  const progress = expected > 0 ? Math.min(collected / expected, 1) : 0;
  const progressPct = Math.round(progress * 100);

  const metaParts = [
    t('dashboard.rentOfExpected', {
      amount: `${formatDisplayNumber(expected, language)} ${currency === 'EUR' ? '€' : currency}`,
    }),
  ];
  if (
    paidCount !== undefined &&
    expectedCount !== undefined &&
    expectedCount > 0
  ) {
    metaParts.push(t('dashboard.rentPaidOfTotal', { paid: paidCount, total: expectedCount }));
  }

  return (
    <View style={{ marginBottom: 12 }}>
      <View style={styles.secheadRow}>
        <Text
          style={{
            fontFamily: displayFontFamily(theme.name),
            fontSize: Typography.display.sectionHead.size,
            lineHeight: Typography.display.sectionHead.lineHeight,
            letterSpacing: Typography.display.sectionHead.letterSpacing,
            color: colors.fg,
          }}
        >
          {t('dashboard.rentCollection')}
        </Text>
        <Text
          style={{
            fontFamily: displayFontFamily(theme.name),
            fontSize: Typography.display.rowFigure.size,
            lineHeight: Typography.display.rowFigure.lineHeight,
            letterSpacing: Typography.display.rowFigure.letterSpacing,
            color: colors.primary,
          }}
        >
          {progressPct} %
        </Text>
      </View>

      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
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
        <View style={[styles.track, { backgroundColor: colors.track }]}>
          <View
            style={[
              styles.fill,
              {
                width: `${progressPct}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>

        <View style={styles.metaRow}>
          <DisplayAmount
            amount={collected}
            currency={currency}
            language={language}
            size={Typography.display.amountSm.size}
            lineHeight={Typography.display.amountSm.lineHeight}
            letterSpacing={Typography.display.amountSm.letterSpacing}
          />
          <Text
            style={{
              fontFamily: Fonts.sans.semibold,
              fontSize: 10,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: colors.muted,
              flexShrink: 1,
            }}
            numberOfLines={1}
          >
            {metaParts.join(' · ')}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  secheadRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 11,
  },
  card: {
    padding: 18,
    borderWidth: 1,
  },
  track: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 9,
    marginTop: 13,
    flexWrap: 'wrap',
  },
});
