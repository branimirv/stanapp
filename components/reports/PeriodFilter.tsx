import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AppDatePicker } from '@/components/ui/AppDatePicker';
import { buildReportPeriod } from '@/hooks/useReports';
import { Colors, Spacing, Typography } from '@/constants/theme';
import type { ReportPeriod, ReportPeriodPreset } from '@/types/app.types';

const PRESET_OPTIONS: ReportPeriodPreset[] = [
  'all_time',
  'current_month',
  'last_3_months',
  'last_6_months',
  'last_12_months',
  'custom',
];

const PRESET_LABELS: Record<ReportPeriodPreset, string> = {
  all_time: 'reports.periodAllTime',
  current_month: 'reports.periodThisMonth',
  last_3_months: 'reports.period3M',
  last_6_months: 'reports.period6M',
  last_12_months: 'reports.period12M',
  custom: 'reports.periodCustom',
};

export interface PeriodFilterProps {
  value: ReportPeriod;
  onChange: (period: ReportPeriod) => void;
  style?: StyleProp<ViewStyle>;
}

function parseDateValue(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateValue(date: Date | null): string {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function PeriodFilter({ value, onChange, style }: PeriodFilterProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [customStart, setCustomStart] = useState(value.startDate);
  const [customEnd, setCustomEnd] = useState(value.endDate);

  const pills = useMemo(
    () =>
      PRESET_OPTIONS.map((preset) => ({
        value: preset,
        label: t(PRESET_LABELS[preset]),
      })),
    [t],
  );

  const handlePresetChange = (preset: ReportPeriodPreset) => {
    if (preset === 'custom') {
      onChange(buildReportPeriod('custom', customStart, customEnd));
      return;
    }
    onChange(buildReportPeriod(preset));
  };

  const handleCustomStartChange = (date: Date | null) => {
    const nextStart = formatDateValue(date);
    setCustomStart(nextStart);
    onChange(buildReportPeriod('custom', nextStart, customEnd));
  };

  const handleCustomEndChange = (date: Date | null) => {
    const nextEnd = formatDateValue(date);
    setCustomEnd(nextEnd);
    onChange(buildReportPeriod('custom', customStart, nextEnd));
  };

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
      >
        {pills.map((pill) => {
          const isSelected = value.preset === pill.value;
          return (
            <Pressable
              key={pill.value}
              onPress={() => handlePresetChange(pill.value)}
              style={({ pressed }) => [
                styles.pill,
                {
                  backgroundColor: isSelected
                    ? theme.colors.primary
                    : theme.dark
                      ? Colors.surfaceVariantDark
                      : Colors.surfaceVariant,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.pillLabel,
                  {
                    color: isSelected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
                numberOfLines={1}
              >
                {pill.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {value.preset === 'custom' ? (
        <View style={styles.customRange}>
          <AppDatePicker
            label={t('common.from')}
            value={parseDateValue(customStart)}
            onChange={handleCustomStartChange}
            style={styles.dateField}
          />
          <AppDatePicker
            label={t('common.to')}
            value={parseDateValue(customEnd)}
            onChange={handleCustomEndChange}
            style={styles.dateField}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    minHeight: 38,
    justifyContent: 'center',
  },
  pillLabel: {
    ...Typography.labelLarge,
    textAlign: 'center',
  },
  customRange: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  dateField: {
    flex: 1,
  },
});
