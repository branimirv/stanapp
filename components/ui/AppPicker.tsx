import { ChevronDown, type LucideIcon } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppBottomSheet } from '@/components/ui/AppBottomSheet';
import { Text } from '@/components/ui/text';
import { Spacing, Typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Fonts } from '@/lib/fonts';

export interface PickerOption<T extends string = string> {
  label: string;
  value: T;
  icon?: LucideIcon;
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
  /** Notify host when the option sheet opens/closes (for BlurOverlay sibling). */
  onVisibilityChange?: (open: boolean) => void;
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
  onVisibilityChange,
}: AppPickerProps<T>) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const { t } = useTranslation();
  const [sheetVisible, setSheetVisible] = useState(false);

  const displayPlaceholder = placeholder ?? t('ui.selectOption');
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const openPicker = useCallback(() => {
    if (disabled || options.length === 0) return;
    setSheetVisible(true);
    onVisibilityChange?.(true);
  }, [disabled, options.length, onVisibilityChange]);

  const dismissSheet = useCallback(() => {
    setSheetVisible(false);
    onVisibilityChange?.(false);
  }, [onVisibilityChange]);

  const handleSelect = useCallback(
    (nextValue: T) => {
      onValueChange(nextValue);
      dismissSheet();
    },
    [dismissSheet, onValueChange],
  );

  const borderColor = error ? colors.neg : colors.bd;

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text
          style={{
            fontFamily: Fonts.sans.semibold,
            fontSize: Typography.text.fieldLabel.size,
            lineHeight: 17,
            color: colors.fg,
            marginBottom: 8,
          }}
        >
          {label}
        </Text>
      ) : null}

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
        accessibilityLabel={label ?? t('common.select')}
      >
        <Text
          className={selectedOption ? 'text-fg flex-1 text-base' : 'text-muted flex-1 text-base'}
          numberOfLines={1}
        >
          {selectedOption?.label ?? displayPlaceholder}
        </Text>
        <ChevronDown size={18} color={colors.muted} strokeWidth={2} />
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

      <AppBottomSheet
        visible={sheetVisible}
        onDismiss={dismissSheet}
        title={label ?? t('common.select')}
        scrollable
        contentStyle={styles.options}
      >
        {options.map((option) => {
          const selected = option.value === value;
          const Icon = option.icon;
          return (
            <Pressable
              key={option.value}
              onPress={() => handleSelect(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={[
                styles.optionRow,
                {
                  backgroundColor: selected ? colors.primaryTint : colors.surface2,
                },
              ]}
            >
              {Icon ? (
                <View
                  style={[
                    styles.iconWell,
                    {
                      backgroundColor: selected ? colors.surface : colors.surface3,
                    },
                  ]}
                >
                  <Icon
                    size={18}
                    color={selected ? colors.primary : colors.muted}
                    strokeWidth={2}
                  />
                </View>
              ) : null}
              <Text
                style={{
                  fontFamily: Fonts.sans.semibold,
                  fontSize: 15,
                  letterSpacing: -0.15,
                  color: selected ? colors.primary : colors.fg,
                  flex: 1,
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </AppBottomSheet>
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
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  options: {
    gap: 10,
    paddingBottom: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  iconWell: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
