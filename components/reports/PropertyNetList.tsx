import { Building2 } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DisplayAmount } from '@/components/ui/DisplayAmount';
import { Typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily, Fonts } from '@/lib/fonts';
import type { Language, PropertyReportSummary } from '@/types/app.types';

export interface PropertyNetListProps {
  summaries: PropertyReportSummary[];
  language?: Language;
}

/** Naslov “Po nekretnini” — icon + name + track bar + Fraunces net. */
export function PropertyNetList({ summaries, language = 'hr' }: PropertyNetListProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors, elevation, radius } = theme;

  const maxNet = Math.max(...summaries.map((s) => Math.abs(s.net)), 1);

  if (summaries.length === 0) return null;

  return (
    <View style={styles.wrap}>
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
        {t('reports.perProperty')}
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
        {summaries.map((summary, index) => {
          const ratio = Math.min(Math.abs(summary.net) / maxNet, 1);
          return (
            <View key={summary.propertyId}>
              {index > 0 ? (
                <View style={[styles.divider, { backgroundColor: colors.bd }]} />
              ) : null}
              <View style={styles.row}>
                <View style={[styles.well, { backgroundColor: colors.surface2 }]}>
                  <Building2 size={18} color={colors.muted} strokeWidth={2} />
                </View>
                <View style={styles.body}>
                  <Text
                    style={{
                      fontFamily: Fonts.sans.semibold,
                      fontSize: Typography.text.listRow.size,
                      color: colors.fg,
                    }}
                    numberOfLines={1}
                  >
                    {summary.propertyName}
                  </Text>
                  <View style={[styles.track, { backgroundColor: colors.track }]}>
                    <View
                      style={[
                        styles.fill,
                        {
                          width: `${Math.max(ratio * 100, summary.net === 0 ? 0 : 4)}%`,
                          backgroundColor:
                            summary.net >= 0 ? colors.primary : colors.neg,
                        },
                      ]}
                    />
                  </View>
                </View>
                <DisplayAmount
                  amount={summary.net}
                  currency={summary.currency === 'EUR' ? '€' : summary.currency}
                  language={language}
                  size={Typography.display.rowFigure.size}
                  lineHeight={Typography.display.rowFigure.lineHeight}
                  letterSpacing={Typography.display.rowFigure.letterSpacing}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
  },
  card: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 51,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 13,
  },
  well: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  track: {
    height: 4,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 7,
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
