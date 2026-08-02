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
import { useTranslation } from 'react-i18next';
import { Colors, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { AppButton } from '@/components/ui/AppButton';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';

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
  const { theme, isDark } = useAppTheme();
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
      style={[styles.field, { borderColor, opacity: disabled ? 0.6 : 1 }]}
      className="bg-background"
      accessibilityRole="button"
      accessibilityLabel={label ?? t('common.select')}
    >
      <Text
        className={selectedOption ? 'flex-1 text-base' : 'text-muted-foreground flex-1 text-base'}
        numberOfLines={1}
      >
        {selectedOption?.label ?? displayPlaceholder}
      </Text>
      <ChevronDown size={20} color={theme.colors.onSurface} strokeWidth={2} />
    </Pressable>
  );

  return (
    <View style={[styles.container, style]}>
      {label ? <Text className="mb-1 text-sm font-semibold">{label}</Text> : null}

      {trigger}

      {error ? <Text className="text-destructive mt-1 text-sm">{error}</Text> : null}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
        <Pressable
          style={styles.modalContent}
          className="bg-card"
          onPress={(event) => event.stopPropagation()}
        >
          <Text className="mb-2 text-center text-lg font-medium">
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
                      backgroundColor: isDark ? Colors.surfaceVariantDark : Colors.primaryLight,
                    },
                  ]}
                >
                  <Text
                    className={option.value === value ? 'text-primary text-base' : 'text-base'}
                  >
                    {option.label}
                  </Text>
                </Pressable>
                {index < options.length - 1 ? <Separator /> : null}
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
  optionsList: {
    marginBottom: Spacing.md,
  },
  optionRow: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: 8,
  },
});
