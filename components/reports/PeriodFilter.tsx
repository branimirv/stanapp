import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppDatePicker } from '@/components/ui/AppDatePicker';
import { Spacing } from '@/constants/theme';
import { buildReportPeriod } from '@/hooks/useReports';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Fonts } from '@/lib/fonts';
import {
  isUsableCustomStartDate,
  resolveCustomReportPeriod,
} from '@/services/reports';
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
  /** Current property filter (`all` or id) — used to re-seed Custom Od. */
  propertyFilter?: string;
  /** First financial activity (yyyy-MM-dd) for the current property scope. */
  earliestActivityDate?: string | null;
  style?: StyleProp<ViewStyle>;
}

function parseDateValue(value: string): Date | null {
  if (!isUsableCustomStartDate(value)) return null;
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

export function PeriodFilter({
  value,
  onChange,
  propertyFilter = 'all',
  earliestActivityDate = null,
  style,
}: PeriodFilterProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const { t } = useTranslation();
  const [customStart, setCustomStart] = useState(value.startDate);
  const [customEnd, setCustomEnd] = useState(value.endDate);
  const previousPropertyRef = useRef(propertyFilter);

  const pills = useMemo(
    () =>
      PRESET_OPTIONS.map((preset) => ({
        value: preset,
        label: t(PRESET_LABELS[preset]),
      })),
    [t],
  );

  useEffect(() => {
    if (value.preset !== 'custom') return;
    setCustomStart(value.startDate);
    setCustomEnd(value.endDate);
  }, [value.preset, value.startDate, value.endDate]);

  // ADR 002: property change while Custom is active → re-seed Od.
  useEffect(() => {
    if (previousPropertyRef.current === propertyFilter) return;
    previousPropertyRef.current = propertyFilter;

    if (value.preset !== 'custom') return;

    const next = resolveCustomReportPeriod({
      carryEnd: value.endDate,
      earliestActivityDate,
      forceReseedStart: true,
    });
    setCustomStart(next.startDate);
    setCustomEnd(next.endDate);
    onChange(next);
  }, [propertyFilter, earliestActivityDate, value.preset, value.endDate, onChange]);

  const handlePresetChange = (preset: ReportPeriodPreset) => {
    if (preset === 'custom') {
      const next = resolveCustomReportPeriod({
        carryStart: value.startDate,
        carryEnd: value.endDate,
        fromPreset: value.preset,
        earliestActivityDate,
      });
      setCustomStart(next.startDate);
      setCustomEnd(next.endDate);
      onChange(next);
      return;
    }
    onChange(buildReportPeriod(preset));
  };

  const handleCustomStartChange = (date: Date | null) => {
    const nextStart = formatDateValue(date);
    if (!nextStart) return;
    let nextEnd = customEnd;
    if (!isUsableCustomStartDate(nextEnd) || nextEnd < nextStart) {
      nextEnd = resolveCustomReportPeriod({
        carryStart: nextStart,
        earliestActivityDate,
        forceReseedStart: true,
      }).endDate;
      if (nextEnd < nextStart) nextEnd = nextStart;
    }
    setCustomStart(nextStart);
    setCustomEnd(nextEnd);
    onChange(buildReportPeriod('custom', nextStart, nextEnd));
  };

  const handleCustomEndChange = (date: Date | null) => {
    const nextEnd = formatDateValue(date);
    if (!nextEnd) return;
    let nextStart = customStart;
    if (!isUsableCustomStartDate(nextStart) || nextEnd < nextStart) {
      nextStart = resolveCustomReportPeriod({
        earliestActivityDate,
        forceReseedStart: true,
      }).startDate;
      if (nextEnd < nextStart) {
        nextStart = nextEnd;
      }
    }
    setCustomStart(nextStart);
    setCustomEnd(nextEnd);
    onChange(buildReportPeriod('custom', nextStart, nextEnd));
  };

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
      >
        {pills.map((pill) => {
          const on = value.preset === pill.value;
          return (
            <Pressable
              key={pill.value}
              onPress={() => handlePresetChange(pill.value)}
              style={[
                styles.pill,
                {
                  backgroundColor: on ? colors.primaryTint : colors.surface2,
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
            >
              <Text
                style={[
                  styles.pillLabel,
                  { color: on ? colors.primary : colors.muted },
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
            maximumDate={parseDateValue(customEnd) ?? undefined}
            style={styles.dateField}
          />
          <AppDatePicker
            label={t('common.to')}
            value={parseDateValue(customEnd)}
            onChange={handleCustomEndChange}
            minimumDate={parseDateValue(customStart) ?? undefined}
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
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillLabel: {
    fontFamily: Fonts.sans.semibold,
    fontSize: 12.5,
    letterSpacing: -0.12,
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
