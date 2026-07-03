import { ChevronDown } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Divider, HelperText, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { AppButton } from '@/components/ui/AppButton';

export interface PickerOption<T extends string = string> {
  label: string;
  value: T;
}

export interface AppPickerProps<T extends string = string> {
  options: PickerOption<T>[];
  value: T | null;
  onValueChange: (value: T) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppPicker<T extends string = string>({
  options,
  value,
  onValueChange,
  label,
  placeholder,
  error,
  disabled = false,
  style,
}: AppPickerProps<T>) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  const displayPlaceholder = placeholder ?? t('ui.selectOption');
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const openPicker = useCallback(() => {
    if (disabled || options.length === 0) return;
    setModalVisible(true);
  }, [disabled, options.length]);

  const handleSelect = useCallback(
    (nextValue: T) => {
      onValueChange(nextValue);
      setModalVisible(false);
    },
    [onValueChange],
  );

  const borderColor = error ? theme.colors.error : theme.colors.outline;

  const trigger = (
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
      accessibilityLabel={label ?? t('common.select')}
    >
      <Text
        style={[
          styles.value,
          {
            color: selectedOption
              ? theme.colors.onSurface
              : theme.colors.onSurfaceVariant,
          },
        ]}
        numberOfLines={1}
      >
        {selectedOption?.label ?? displayPlaceholder}
      </Text>
      <ChevronDown size={20} color={theme.colors.onSurfaceVariant} strokeWidth={2} />
    </Pressable>
  );

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text style={[styles.label, { color: theme.colors.onSurface }]}>
          {label}
        </Text>
      ) : null}

      {trigger}

      {error ? (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      ) : null}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface },
            ]}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
              {label ?? t('common.select')}
            </Text>

            <ScrollView style={styles.optionsList}>
              {options.map((option, index) => (
                <View key={option.value}>
                  <Pressable
                    onPress={() => handleSelect(option.value)}
                    style={[
                      styles.optionRow,
                      option.value === value && {
                        backgroundColor: theme.dark
                          ? Colors.surfaceVariantDark
                          : Colors.primaryLight,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color:
                            option.value === value
                              ? theme.colors.primary
                              : theme.colors.onSurface,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                  {index < options.length - 1 ? <Divider /> : null}
                </View>
              ))}
            </ScrollView>

            <AppButton mode="text" onPress={() => setModalVisible(false)}>
              {t('common.cancel')}
            </AppButton>
          </Pressable>
        </Pressable>
      </Modal>
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
    justifyContent: 'space-between',
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
    maxHeight: '70%',
  },
  modalTitle: {
    ...Typography.titleMedium,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  optionsList: {
    marginBottom: Spacing.md,
  },
  optionRow: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: 8,
  },
  optionLabel: {
    ...Typography.bodyLarge,
  },
});
