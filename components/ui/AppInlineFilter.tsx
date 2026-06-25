import { ChevronDown } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Divider, Menu, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { AppButton } from '@/components/ui/AppButton';
import type { PickerOption } from '@/components/ui/AppPicker';

export interface AppInlineFilterProps<T extends string = string> {
  options: PickerOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  title?: string;
  prefixLabel?: string;
  accent?: boolean;
  showChevron?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  onOpen?: () => void;
}

export function AppInlineFilter<T extends string = string>({
  options,
  value,
  onValueChange,
  title,
  prefixLabel,
  accent = false,
  showChevron = false,
  disabled = false,
  style,
  onOpen,
}: AppInlineFilterProps<T>) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [menuVisible, setMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const useModal = Platform.OS === 'web' || width < 400;
  const labelColor = accent ? theme.colors.primary : theme.colors.onSurface;

  const openPicker = useCallback(() => {
    if (disabled) return;
    onOpen?.();
    if (useModal) {
      setModalVisible(true);
    } else {
      setMenuVisible(true);
    }
  }, [disabled, onOpen, useModal]);

  const handleSelect = useCallback(
    (nextValue: T) => {
      onValueChange(nextValue);
      setMenuVisible(false);
      setModalVisible(false);
    },
    [onValueChange],
  );

  const displayLabel = selectedOption?.label ?? t('ui.selectOption');
  const accessibilityLabel = prefixLabel
    ? `${prefixLabel}: ${displayLabel}`
    : displayLabel;

  const trigger = (
    <Pressable
      onPress={openPicker}
      disabled={disabled}
      style={({ pressed }) => [
        styles.trigger,
        { opacity: disabled ? 0.5 : pressed ? 0.7 : 1 },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Text
        style={[
          styles.label,
          {
            color: labelColor,
            fontWeight: accent ? '600' : '500',
          },
        ]}
        numberOfLines={1}
      >
        {prefixLabel ? (
          <>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>{prefixLabel} · </Text>
            {displayLabel}
          </>
        ) : (
          displayLabel
        )}
      </Text>
      {showChevron ? (
        <ChevronDown size={16} color={labelColor} strokeWidth={2.5} />
      ) : null}
    </Pressable>
  );

  return (
    <>
      {useModal ? (
        trigger
      ) : (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={trigger}
          contentStyle={[
            styles.menuContent,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <ScrollView style={styles.menuScroll} nestedScrollEnabled>
            {options.map((option) => (
              <Menu.Item
                key={option.value}
                title={option.label}
                onPress={() => handleSelect(option.value)}
                titleStyle={
                  option.value === value
                    ? { color: theme.colors.primary, fontWeight: '600' }
                    : undefined
                }
              />
            ))}
          </ScrollView>
        </Menu>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
              {title ?? t('common.select')}
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
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    flexShrink: 0,
  },
  label: {
    ...Typography.bodyLarge,
  },
  menuContent: {
    maxHeight: 280,
    borderRadius: 12,
  },
  menuScroll: {
    maxHeight: 280,
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
