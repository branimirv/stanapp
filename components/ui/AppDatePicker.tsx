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
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppBottomSheet } from '@/components/ui/AppBottomSheet';
import { AppButton } from '@/components/ui/AppButton';
import { Text } from '@/components/ui/text';
import { Spacing, Typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Fonts } from '@/lib/fonts';

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

  const borderColor = error ? colors.neg : colors.bd;

  return (
    <View style={[styles.container, style]}>
      <Text
        style={{
          fontFamily: Fonts.sans.semibold,
          fontSize: Typography.text.fieldLabel.size,
          lineHeight: 17,
          color: colors.fg,
          marginBottom: 8,
        }}
      >
        {displayLabel}
      </Text>

      <Pressable
        onPress={openPicker}
        disabled={disabled}
        style={[
          styles.field,
          {
            backgroundColor: colors.surface2,
            borderColor,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
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
        <Text
          style={{
            fontFamily: Fonts.sans.regular,
            fontSize: 14,
            color: colors.neg,
            marginTop: 6,
          }}
        >
          {error}
        </Text>
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
          contentStyle={styles.sheetBody}
        >
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
            style={styles.picker}
          />

          <View style={styles.actions}>
            <AppButton mode="text" onPress={handleClear} className="flex-1">
              {t('common.clear')}
            </AppButton>
            <AppButton mode="contained" onPress={handleConfirm} className="flex-1">
              {t('common.done')}
            </AppButton>
          </View>
        </AppBottomSheet>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  field: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sheetBody: {
    alignItems: 'stretch',
  },
  picker: {
    alignSelf: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: Spacing.md,
  },
});
