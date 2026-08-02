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
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/ui/AppButton';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { cn } from '@/lib/utils';
import { formatPeriod } from '@/utils/formatters';
import type { DashboardPeriod, Language } from '@/types/app.types';

const dateLocales = { en: enUS, hr } as const;
const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export interface DashboardPeriodFilterProps {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
  language?: Language;
  style?: StyleProp<ViewStyle>;
  className?: string;
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
  className,
}: DashboardPeriodFilterProps) {
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
    <View className={cn('mb-4', className)} style={style}>
      <View className="flex-row items-center justify-center gap-2">
        <Pressable
          onPress={handlePrev}
          accessibilityRole="button"
          accessibilityLabel={t('common.previous')}
        >
          <GlassSurface shape="circle" interactive style={{ width: 36, height: 36 }} contentStyle={styles.iconHit}>
            <Icon as={ChevronLeft} size={20} className="text-foreground" strokeWidth={2} />
          </GlassSurface>
        </Pressable>

        <Pressable
          onPress={openPicker}
          className="max-w-55 flex-1"
          accessibilityRole="button"
          accessibilityLabel={t('dashboard.selectPeriod')}
        >
          <GlassSurface shape="pill" interactive contentStyle={styles.periodLabel}>
            <Text className="text-foreground text-base font-medium">{displayLabel}</Text>
          </GlassSurface>
        </Pressable>

        <Pressable
          onPress={handleNext}
          disabled={!canStepForward}
          style={!canStepForward ? { opacity: 0.35 } : undefined}
          accessibilityRole="button"
          accessibilityLabel={t('common.next')}
        >
          <GlassSurface shape="circle" interactive style={{ width: 36, height: 36 }} contentStyle={styles.iconHit}>
            <Icon as={ChevronRight} size={20} className="text-foreground" strokeWidth={2} />
          </GlassSurface>
        </Pressable>
      </View>

      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={closePicker}
      >
        <View className="flex-1 justify-end bg-black/45">
          <View
            className="bg-card rounded-t-[20px] px-6 pt-6"
            style={{ paddingBottom: Platform.OS === 'ios' ? 40 : 32 }}
          >
            <Text className="mb-4 text-center text-base font-medium">
              {t('dashboard.selectPeriod')}
            </Text>

            <View className="mb-4 flex-row items-center justify-center gap-6">
              <Pressable onPress={() => handleYearStep(-1)} className="p-1" accessibilityRole="button">
                <Icon as={ChevronLeft} size={22} className="text-foreground" strokeWidth={2} />
              </Pressable>
              <Text className="min-w-18 text-center text-xl font-semibold">{pickerYear}</Text>
              <Pressable
                onPress={() => handleYearStep(1)}
                disabled={!canStepYearForward}
                className={cn('p-1', !canStepYearForward && 'opacity-35')}
                accessibilityRole="button"
              >
                <Icon as={ChevronRight} size={22} className="text-foreground" strokeWidth={2} />
              </Pressable>
            </View>

            <View className="mb-6 flex-row flex-wrap gap-2">
              {MONTHS.map((month, index) => {
                const isSelected = pickerMonth === month;
                const isDisabled = isFutureMonth(month, pickerYear);

                return (
                  <Pressable
                    key={month}
                    onPress={() => handleMonthSelect(month)}
                    disabled={isDisabled}
                    className={cn(
                      'grow items-center rounded-md py-2',
                      isSelected ? 'bg-primary' : 'bg-muted',
                      isDisabled && 'opacity-35',
                    )}
                    style={{ width: '30%' }}
                  >
                    <Text
                      className={cn(
                        'text-sm font-medium',
                        isSelected && 'text-primary-foreground',
                      )}
                    >
                      {monthLabels[index]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="flex-row items-center justify-end gap-1">
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
  iconHit: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodLabel: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
});
