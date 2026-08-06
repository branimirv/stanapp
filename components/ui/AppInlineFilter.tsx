import { ChevronDown } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppBottomSheet } from '@/components/ui/AppBottomSheet';
import type { PickerOption } from '@/components/ui/AppPicker';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Fonts } from '@/lib/fonts';

export interface AppInlineFilterProps<T extends string = string> {
  options: PickerOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  title?: string;
  prefixLabel?: string;
  /** When true, pill uses primary tint (Naslov `.fpill.on`). */
  accent?: boolean;
  showChevron?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  onOpen?: () => void;
  /** Notify host when the option sheet opens/closes (for blur + tab chrome). */
  onVisibilityChange?: (open: boolean) => void;
}

export function AppInlineFilter<T extends string = string>({
  options,
  value,
  onValueChange,
  title,
  prefixLabel,
  accent = false,
  showChevron = true,
  disabled = false,
  style,
  onOpen,
  onVisibilityChange,
}: AppInlineFilterProps<T>) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const { t } = useTranslation();
  const [sheetVisible, setSheetVisible] = useState(false);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const labelColor = accent ? colors.primary : colors.fg;
  const chevronColor = accent ? colors.primary : colors.muted;

  const openPicker = useCallback(() => {
    if (disabled) return;
    onOpen?.();
    setSheetVisible(true);
    onVisibilityChange?.(true);
  }, [disabled, onOpen, onVisibilityChange]);

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

  const displayLabel = selectedOption?.label ?? t('ui.selectOption');
  const accessibilityLabel = prefixLabel
    ? `${prefixLabel}: ${displayLabel}`
    : displayLabel;

  return (
    <>
      <Pressable
        onPress={openPicker}
        disabled={disabled}
        style={[
          styles.fpill,
          {
            backgroundColor: accent ? colors.primaryTint : colors.surface2,
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Text
          style={{
            fontFamily: Fonts.sans.semibold,
            fontSize: 12.5,
            letterSpacing: -0.125,
            color: labelColor,
          }}
          numberOfLines={1}
        >
          {prefixLabel ? `${prefixLabel} · ${displayLabel}` : displayLabel}
        </Text>
        {showChevron ? <ChevronDown size={14} color={chevronColor} strokeWidth={2.5} /> : null}
      </Pressable>

      <AppBottomSheet
        visible={sheetVisible}
        onDismiss={dismissSheet}
        title={title ?? t('common.select')}
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
    </>
  );
}

const styles = StyleSheet.create({
  fpill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingLeft: 14,
    paddingRight: 12,
    borderRadius: 999,
    flexShrink: 0,
  },
  options: {
    gap: 10,
    paddingBottom: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    height: 56,
    borderRadius: 999,
    paddingHorizontal: 14,
  },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
