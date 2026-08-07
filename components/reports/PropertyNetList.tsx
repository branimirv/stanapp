import { Building2 } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DisplayAmount } from '@/components/ui/DisplayAmount';
import { Typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily } from '@/lib/fonts';
import type { Language, PropertyReportSummary } from '@/types/app.types';

export interface PropertyNetListProps {
  summaries: PropertyReportSummary[];
  language?: Language;
}

/** Naslov “Po nekretnini” — icon + name + track bar + Fraunces net. */
export function PropertyNetList({ summaries, language = 'hr' }: PropertyNetListProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors, elevation } = theme;

  const maxNet = Math.max(...summaries.map((s) => Math.abs(s.net)), 1);

  if (summaries.length === 0) return null;

  return (
    <View className="mb-2">
      <Text
        className="text-fg mb-2.75 text-[22px] leading-6 tracking-[-0.55px]"
        style={{ fontFamily: displayFontFamily(theme.name) }}
      >
        {t('reports.perProperty')}
      </Text>

      <View
        className="border-card-bd bg-surface rounded-xl border px-4.5 pt-1 pb-1.5"
        style={[{ borderWidth: StyleSheet.hairlineWidth }, elevation.card]}
      >
        {summaries.map((summary, index) => {
          const ratio = Math.min(Math.abs(summary.net) / maxNet, 1);
          return (
            <View key={summary.propertyId}>
              {index > 0 ? (
                <View
                  className="bg-bd ml-12.75"
                  style={{ height: StyleSheet.hairlineWidth }}
                />
              ) : null}
              <View className="flex-row items-center gap-3.25 py-3.25">
                <View className="bg-surface-2 h-9.5 w-9.5 items-center justify-center rounded-full">
                  <Building2 size={18} color={colors.muted} strokeWidth={2} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="text-fg text-[15px] font-semibold" numberOfLines={1}>
                    {summary.propertyName}
                  </Text>
                  <View className="bg-track mt-1.75 h-1 overflow-hidden rounded-full">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(ratio * 100, summary.net === 0 ? 0 : 4)}%`,
                        backgroundColor: summary.net >= 0 ? colors.primary : colors.neg,
                      }}
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
