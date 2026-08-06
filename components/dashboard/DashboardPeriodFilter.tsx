import { format } from 'date-fns';
import { enUS, hr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/ui/AppButton';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily, Fonts } from '@/lib/fonts';
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
    <View className={className} style={[{ marginBottom: 14 }, style]}>
      <View style={styles.mrow}>
        <Pressable
          onPress={handlePrev}
          accessibilityRole="button"
          accessibilityLabel={t('common.previous')}
          style={[styles.mb, { backgroundColor: colors.surface2 }]}
        >
          <ChevronLeft size={15} color={colors.muted} strokeWidth={2} />
        </Pressable>

        <Pressable
          onPress={openPicker}
          style={[styles.ml, { backgroundColor: colors.surface2 }]}
          accessibilityRole="button"
          accessibilityLabel={t('dashboard.selectPeriod')}
        >
          <Text
            style={{
              fontFamily: displayFontFamily(theme.name),
              fontSize: 15,
              letterSpacing: -0.3,
              color: colors.fg,
              textAlign: 'center',
            }}
            numberOfLines={1}
          >
            {displayLabel}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleNext}
          disabled={!canStepForward}
          style={[
            styles.mb,
            { backgroundColor: colors.surface2 },
            !canStepForward && { opacity: 0.35 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t('common.next')}
        >
          <ChevronRight size={15} color={colors.muted} strokeWidth={2} />
        </Pressable>
      </View>

      <Modal visible={showPicker} transparent animationType="slide" onRequestClose={closePicker}>
        <View className="flex-1 justify-end bg-black/45">
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 26,
              borderTopRightRadius: 26,
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: Platform.OS === 'ios' ? 40 : 32,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.sans.semibold,
                fontSize: 16,
                textAlign: 'center',
                color: colors.fg,
                marginBottom: 16,
              }}
            >
              {t('dashboard.selectPeriod')}
            </Text>

            <View className="mb-4 flex-row items-center justify-center gap-6">
              <Pressable onPress={() => handleYearStep(-1)} className="p-1" accessibilityRole="button">
                <ChevronLeft size={22} color={colors.fg} strokeWidth={2} />
              </Pressable>
              <Text
                style={{
                  fontFamily: Fonts.sans.semibold,
                  fontSize: 20,
                  minWidth: 72,
                  textAlign: 'center',
                  color: colors.fg,
                }}
              >
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
                    className={cn('grow items-center rounded-md py-2', isDisabled && 'opacity-35')}
                    style={{
                      width: '30%',
                      backgroundColor: isSelected ? colors.primary : colors.surface2,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.sans.medium,
                        fontSize: 14,
                        color: isSelected ? colors.onPrimary : colors.fg,
                      }}
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
  mrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mb: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ml: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
