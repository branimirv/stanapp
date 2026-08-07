import { format } from 'date-fns';
import { enUS, hr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/ui/AppButton';
import { MODAL_SHEET_BOTTOM_PADDING } from '@/constants/sheet';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily } from '@/lib/fonts';
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
  const { theme } = useAppTheme();
  const { colors } = theme;
  const [showPicker, setShowPicker] = useState(false);

  const current = getCurrentMonthYear();
  const [pickerMonth, setPickerMonth] = useState(value.month);
  const [pickerYear, setPickerYear] = useState(value.year);

  const locale = dateLocales[language];

  const monthLabels = useMemo(
    () => MONTHS.map((month) => format(new Date(2024, month - 1, 1), 'MMM', { locale })),
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
    onChange(stepMonth(value.month, value.year, -1));
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

  const handleMonthSelect = useCallback(
    (month: number) => {
      if (isFutureMonth(month, pickerYear)) return;
      setPickerMonth(month);
    },
    [pickerYear],
  );

  const canStepYearForward = pickerYear < current.year;
  const canConfirmMonth = !isFutureMonth(pickerMonth, pickerYear);

  return (
    <View className={cn('mb-3.5', className)} style={style}>
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={handlePrev}
          accessibilityRole="button"
          accessibilityLabel={t('common.previous')}
          className="bg-surface-2 h-9 w-9 items-center justify-center rounded-full"
        >
          <ChevronLeft size={15} color={colors.muted} strokeWidth={2} />
        </Pressable>

        <Pressable
          onPress={openPicker}
          className="bg-surface-2 flex-1 items-center justify-center rounded-full py-2.25"
          accessibilityRole="button"
          accessibilityLabel={t('dashboard.selectPeriod')}
        >
          <Text
            className="text-fg text-center text-[15px] tracking-[-0.3px]"
            style={{ fontFamily: displayFontFamily(theme.name) }}
            numberOfLines={1}
          >
            {displayLabel}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleNext}
          disabled={!canStepForward}
          className={cn(
            'bg-surface-2 h-9 w-9 items-center justify-center rounded-full',
            !canStepForward && 'opacity-35',
          )}
          accessibilityRole="button"
          accessibilityLabel={t('common.next')}
        >
          <ChevronRight size={15} color={colors.muted} strokeWidth={2} />
        </Pressable>
      </View>

      <Modal visible={showPicker} transparent animationType="slide" onRequestClose={closePicker}>
        <View className="flex-1 justify-end bg-black/45">
          <View
            className="bg-surface rounded-t-2xl px-6 pt-6"
            style={{ paddingBottom: MODAL_SHEET_BOTTOM_PADDING }}
          >
            <Text className="text-fg mb-4 text-center text-base font-semibold">
              {t('dashboard.selectPeriod')}
            </Text>

            <View className="mb-4 flex-row items-center justify-center gap-6">
              <Pressable onPress={() => handleYearStep(-1)} className="p-1" accessibilityRole="button">
                <ChevronLeft size={22} color={colors.fg} strokeWidth={2} />
              </Pressable>
              <Text className="text-fg min-w-18 text-center text-xl font-semibold">
                {pickerYear}
              </Text>
              <Pressable
                onPress={() => handleYearStep(1)}
                disabled={!canStepYearForward}
                className={cn('p-1', !canStepYearForward && 'opacity-35')}
                accessibilityRole="button"
              >
                <ChevronRight size={22} color={colors.fg} strokeWidth={2} />
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
                      isSelected ? 'bg-primary' : 'bg-surface-2',
                      isDisabled && 'opacity-35',
                    )}
                    style={{ width: '30%' }}
                  >
                    <Text
                      className={cn(
                        'text-sm font-medium',
                        isSelected ? 'text-on-primary' : 'text-fg',
                      )}
                    >
                      {monthLabels[index]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="flex-row items-center justify-end gap-1">
              <AppButton variant="ghost" onPress={closePicker}>
                {t('common.cancel')}
              </AppButton>
              <AppButton variant="default" onPress={handleConfirm} disabled={!canConfirmMonth}>
                {t('common.done')}
              </AppButton>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
