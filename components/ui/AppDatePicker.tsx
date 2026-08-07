import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { enUS, hr } from 'date-fns/locale';
import { Calendar } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppBottomSheet } from '@/components/ui/AppBottomSheet';
import { AppButton } from '@/components/ui/AppButton';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/useAppTheme';
import { cn } from '@/lib/utils';

const dateLocales = { en: enUS, hr } as const;

export interface AppDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  error?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
  /** Notify host when the sheet opens/closes (for BlurOverlay sibling). */
  onVisibilityChange?: (open: boolean) => void;
}

export function AppDatePicker({
  value,
  onChange,
  label,
  placeholder,
  minimumDate,
  maximumDate,
  error,
  disabled = false,
  style,
  className,
  onVisibilityChange,
}: AppDatePickerProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const { t, i18n } = useTranslation();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value ?? new Date());

  const locale = i18n.language === 'hr' ? dateLocales.hr : dateLocales.en;
  const displayLabel = label ?? t('common.date');
  const displayPlaceholder = placeholder ?? t('ui.selectDate');

  const formattedValue = useMemo(() => {
    if (!value) return displayPlaceholder;
    return format(value, 'dd.MM.yyyy', { locale });
  }, [value, displayPlaceholder, locale]);

  const openPicker = useCallback(() => {
    if (disabled) return;
    setTempDate(value ?? new Date());
    setSheetVisible(true);
    onVisibilityChange?.(true);
  }, [disabled, onVisibilityChange, value]);

  const dismissSheet = useCallback(() => {
    setSheetVisible(false);
    onVisibilityChange?.(false);
  }, [onVisibilityChange]);

  const handleAndroidChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      setSheetVisible(false);
      onVisibilityChange?.(false);
      if (event.type === 'set' && selectedDate) {
        onChange(selectedDate);
      }
    },
    [onChange, onVisibilityChange],
  );

  const handleConfirm = useCallback(() => {
    onChange(tempDate);
    dismissSheet();
  }, [dismissSheet, onChange, tempDate]);

  const handleClear = useCallback(() => {
    onChange(null);
    dismissSheet();
  }, [dismissSheet, onChange]);

  return (
    <View className={cn('w-full', className)} style={style}>
      <Text className="text-fg mb-2 text-[13px] leading-gutter font-semibold">
        {displayLabel}
      </Text>

      <Pressable
        onPress={openPicker}
        disabled={disabled}
        className={cn(
          'bg-surface-2 border-bd min-h-12 flex-row items-center gap-2 rounded-md border px-3.5',
          error && 'border-neg',
          disabled && 'opacity-60',
        )}
        accessibilityRole="button"
        accessibilityLabel={displayLabel}
        accessibilityHint={t('ui.selectDate')}
      >
        <Calendar size={16} color={colors.primary} strokeWidth={2} />
        <Text className={value ? 'text-fg flex-1 text-base' : 'text-muted flex-1 text-base'}>
          {formattedValue}
        </Text>
      </Pressable>

      {error ? (
        <Text className="text-neg mt-1.5 text-sm">{error}</Text>
      ) : null}

      {Platform.OS === 'android' && sheetVisible ? (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleAndroidChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      ) : null}

      {Platform.OS !== 'android' ? (
        <AppBottomSheet
          visible={sheetVisible}
          onDismiss={dismissSheet}
          title={t('ui.selectDate')}
        >
          <View className="items-stretch">
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={(_, selectedDate) => {
                if (selectedDate) setTempDate(selectedDate);
              }}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              locale={i18n.language}
              style={{ alignSelf: 'center' }}
            />

            <View className="mt-4 flex-row items-center gap-2.5">
              <AppButton variant="ghost" onPress={handleClear} className="flex-1">
                {t('common.clear')}
              </AppButton>
              <AppButton variant="default" onPress={handleConfirm} className="flex-1">
                {t('common.done')}
              </AppButton>
            </View>
          </View>
        </AppBottomSheet>
      ) : null}
    </View>
  );
}
