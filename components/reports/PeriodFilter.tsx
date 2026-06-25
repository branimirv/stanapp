import { useMemo, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AppDatePicker } from '@/components/ui/AppDatePicker';
import { AppSegmentedControl } from '@/components/ui/AppSegmentedControl';
import { buildReportPeriod } from '@/hooks/useReports';
import { Spacing, Typography } from '@/constants/theme';
import type { ReportPeriod, ReportPeriodPreset } from '@/types/app.types';

const PRESET_OPTIONS: ReportPeriodPreset[] = [
  'current_month',
  'last_3_months',
  'last_6_months',
  'last_12_months',
  'custom',
];

const PRESET_LABELS: Record<ReportPeriodPreset, string> = {
  current_month: 'reports.currentMonth',
  last_3_months: 'reports.last3Months',
  last_6_months: 'reports.last6Months',
  last_12_months: 'reports.last12Months',
  custom: 'reports.customRange',
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

  const segments = useMemo(
    () =>
      PRESET_OPTIONS.map((preset) => ({
        value: preset,
        label: t(PRESET_LABELS[preset]),
      })),
    [t],
  );

  const handlePresetChange = (preset: ReportPeriodPreset) => {
    if (preset === 'custom') {
      onChange(
        buildReportPeriod('custom', customStart, customEnd),
      );
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
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        {t('reports.periodFilter')}
      </Text>

      <AppSegmentedControl
        segments={segments.slice(0, 3)}
        value={value.preset}
        onValueChange={(next) => handlePresetChange(next as ReportPeriodPreset)}
        style={styles.segmentRow}
      />

      <AppSegmentedControl
        segments={segments.slice(3)}
        value={value.preset}
        onValueChange={(next) => handlePresetChange(next as ReportPeriodPreset)}
        style={styles.segmentRow}
      />

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
  title: {
    ...Typography.titleMedium,
  },
  segmentRow: {
    marginBottom: Spacing.xs,
  },
  customRange: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  dateField: {
    flex: 1,
  },
});
