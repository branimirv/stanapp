import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { enUS, hr } from 'date-fns/locale';
import { Calendar } from 'lucide-react-native';
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
import { HelperText, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Spacing, Typography } from '@/constants/theme';
import { AppButton } from '@/components/ui/AppButton';

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
}: AppDatePickerProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const [showPicker, setShowPicker] = useState(false);
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
    setShowPicker(true);
  }, [disabled, value]);

  const closePicker = useCallback(() => {
    setShowPicker(false);
  }, []);

  const handleAndroidChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      setShowPicker(false);
      if (event.type === 'set' && selectedDate) {
        onChange(selectedDate);
      }
    },
    [onChange],
  );

  const handleIosConfirm = useCallback(() => {
    onChange(tempDate);
    closePicker();
  }, [closePicker, onChange, tempDate]);

  const handleClear = useCallback(() => {
    onChange(null);
    closePicker();
  }, [closePicker, onChange]);

  const borderColor = error
    ? theme.colors.error
    : theme.colors.outline;

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, { color: theme.colors.onSurface }]}>
        {displayLabel}
      </Text>

      <Pressable
        onPress={openPicker}
        disabled={disabled}
        style={[
          styles.field,
          {
            borderColor,
            backgroundColor: theme.colors.background,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={displayLabel}
        accessibilityHint={t('ui.selectDate')}
      >
        <Calendar size={20} color={theme.colors.primary} strokeWidth={2} />
        <Text
          style={[
            styles.value,
            {
              color: value ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
            },
          ]}
        >
          {formattedValue}
        </Text>
      </Pressable>

      {error ? (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      ) : null}

      {Platform.OS === 'android' && showPicker ? (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleAndroidChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      ) : null}

      {Platform.OS === 'ios' || Platform.OS === 'web' ? (
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
                {t('ui.selectDate')}
              </Text>

              <DateTimePicker
                value={tempDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, selectedDate) => {
                  if (selectedDate) setTempDate(selectedDate);
                }}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                locale={i18n.language}
                style={styles.picker}
              />

              <View style={styles.modalActions}>
                <AppButton mode="text" onPress={handleClear}>
                  {t('common.clear')}
                </AppButton>
                <View style={styles.modalActionsRight}>
                  <AppButton mode="text" onPress={closePicker}>
                    {t('common.cancel')}
                  </AppButton>
                  <AppButton mode="contained" onPress={handleIosConfirm}>
                    {t('common.done')}
                  </AppButton>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    ...Typography.labelLarge,
    marginBottom: Spacing.xs,
  },
  field: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  value: {
    ...Typography.bodyLarge,
    flex: 1,
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
    paddingBottom: Spacing.xl,
  },
  modalTitle: {
    ...Typography.titleMedium,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  picker: {
    alignSelf: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  modalActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
