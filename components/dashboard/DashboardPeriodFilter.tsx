import { format } from 'date-fns';
import { enUS, hr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/ui/AppButton';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { formatPeriod } from '@/utils/formatters';
import type { DashboardPeriod, Language } from '@/types/app.types';

const dateLocales = { en: enUS, hr } as const;
const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export interface DashboardPeriodFilterProps {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
  language?: Language;
  style?: StyleProp<ViewStyle>;
}

function getCurrentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

function isFutureMonth(month: number, year: number): boolean {
  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
  return year > currentYear || (year === currentYear && month > currentMonth);
}

function stepMonth(month: number, year: number, delta: number): { month: number; year: number } {
  const date = new Date(year, month - 1 + delta, 1);
  return { month: date.getMonth() + 1, year: date.getFullYear() };
}

export function DashboardPeriodFilter({
  value,
  onChange,
  language = 'hr',
  style,
}: DashboardPeriodFilterProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [showPicker, setShowPicker] = useState(false);

  const current = getCurrentMonthYear();
  const [pickerMonth, setPickerMonth] = useState(value.month);
  const [pickerYear, setPickerYear] = useState(value.year);

  const locale = dateLocales[language];

  const monthLabels = useMemo(
    () =>
      MONTHS.map((month) =>
        format(new Date(2024, month - 1, 1), 'MMM', { locale }),
      ),
    [locale],
  );

  const displayLabel = formatPeriod(value.month, value.year, language);

  const canStepForward = useMemo(() => {
    const next = stepMonth(value.month, value.year, 1);
    return !isFutureMonth(next.month, next.year);
  }, [value]);

  const openPicker = useCallback(() => {
    setPickerMonth(value.month);
    setPickerYear(value.year);
    setShowPicker(true);
  }, [value.month, value.year]);

  const closePicker = useCallback(() => {
    setShowPicker(false);
  }, []);

  const handlePrev = useCallback(() => {
    const next = stepMonth(value.month, value.year, -1);
    onChange(next);
  }, [onChange, value]);

  const handleNext = useCallback(() => {
    const next = stepMonth(value.month, value.year, 1);
    if (isFutureMonth(next.month, next.year)) return;
    onChange(next);
  }, [onChange, value]);

  const handleConfirm = useCallback(() => {
    onChange({ month: pickerMonth, year: pickerYear });
    closePicker();
  }, [closePicker, onChange, pickerMonth, pickerYear]);

  const handleYearStep = useCallback((delta: number) => {
    setPickerYear((prev) => prev + delta);
  }, []);

  const handleMonthSelect = useCallback((month: number) => {
    if (isFutureMonth(month, pickerYear)) return;
    setPickerMonth(month);
  }, [pickerYear]);

  const canStepYearForward = pickerYear < current.year;
  const canConfirmMonth = !isFutureMonth(pickerMonth, pickerYear);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <Pressable
          onPress={handlePrev}
          style={[styles.chevron, { backgroundColor: theme.dark ? Colors.surfaceDark : Colors.surface }]}
          accessibilityRole="button"
          accessibilityLabel={t('common.previous')}
        >
          <ChevronLeft size={20} color={theme.colors.onSurface} strokeWidth={2} />
        </Pressable>

        <Pressable
          onPress={openPicker}
          style={[
            styles.pill,
            {
              backgroundColor: theme.dark ? Colors.surfaceDark : Colors.surface,
              borderColor: theme.colors.outline,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t('dashboard.selectPeriod')}
        >
          <Text style={[styles.pillText, { color: theme.colors.onSurface }]}>{displayLabel}</Text>
        </Pressable>

        <Pressable
          onPress={handleNext}
          disabled={!canStepForward}
          style={[
            styles.chevron,
            {
              backgroundColor: theme.dark ? Colors.surfaceDark : Colors.surface,
              opacity: canStepForward ? 1 : 0.35,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t('common.next')}
        >
          <ChevronRight size={20} color={theme.colors.onSurface} strokeWidth={2} />
        </Pressable>
      </View>

      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={closePicker}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
              {t('dashboard.selectPeriod')}
            </Text>

            <View style={styles.yearRow}>
              <Pressable
                onPress={() => handleYearStep(-1)}
                style={styles.yearChevron}
                accessibilityRole="button"
              >
                <ChevronLeft size={22} color={theme.colors.onSurface} strokeWidth={2} />
              </Pressable>
              <Text style={[styles.yearLabel, { color: theme.colors.onSurface }]}>
                {pickerYear}
              </Text>
              <Pressable
                onPress={() => handleYearStep(1)}
                disabled={!canStepYearForward}
                style={[styles.yearChevron, { opacity: canStepYearForward ? 1 : 0.35 }]}
                accessibilityRole="button"
              >
                <ChevronRight size={22} color={theme.colors.onSurface} strokeWidth={2} />
              </Pressable>
            </View>

            <View style={styles.monthGrid}>
              {MONTHS.map((month, index) => {
                const isSelected = pickerMonth === month;
                const isDisabled = isFutureMonth(month, pickerYear);

                return (
                  <Pressable
                    key={month}
                    onPress={() => handleMonthSelect(month)}
                    disabled={isDisabled}
                    style={[
                      styles.monthCell,
                      {
                        backgroundColor: isSelected
                          ? Colors.primary
                          : theme.dark
                            ? Colors.surfaceVariantDark
                            : Colors.surfaceVariant,
                        opacity: isDisabled ? 0.35 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.monthLabel,
                        {
                          color: isSelected ? Colors.textInverse : theme.colors.onSurface,
                        },
                      ]}
                    >
                      {monthLabels[index]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <AppButton mode="text" onPress={closePicker}>
                {t('common.cancel')}
              </AppButton>
              <AppButton mode="contained" onPress={handleConfirm} disabled={!canConfirmMonth}>
                {t('common.done')}
              </AppButton>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  chevron: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    flex: 1,
    maxWidth: 220,
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  pillText: {
    ...Typography.titleMedium,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl + 8 : Spacing.xl,
  },
  modalTitle: {
    ...Typography.titleMedium,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  yearChevron: {
    padding: Spacing.xs,
  },
  yearLabel: {
    ...Typography.headlineMedium,
    minWidth: 72,
    textAlign: 'center',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  monthCell: {
    width: '30%',
    flexGrow: 1,
    borderRadius: 10,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  monthLabel: {
    ...Typography.labelLarge,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.xs,
  },
});
