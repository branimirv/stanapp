import { ChevronDown, type LucideIcon } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppBottomSheet } from '@/components/ui/AppBottomSheet';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/useAppTheme';
import { cn } from '@/lib/utils';

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
  className?: string;
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
  className,
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

  return (
    <View className={cn('w-full', className)} style={style}>
      {label ? (
        <Text className="text-fg mb-2 text-[13px] leading-gutter font-semibold">
          {label}
        </Text>
      ) : null}

      <Pressable
        onPress={openPicker}
        disabled={disabled}
        className={cn(
          'bg-surface-2 border-bd min-h-12 flex-row items-center justify-between gap-2 rounded-md border px-3.5',
          error && 'border-neg',
          disabled && 'opacity-60',
        )}
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
        <Text className="text-neg mt-1.5 text-sm">{error}</Text>
      ) : null}

      <AppBottomSheet
        visible={sheetVisible}
        onDismiss={dismissSheet}
        title={label ?? t('common.select')}
        scrollable
      >
        <View className="gap-2.5 pb-1">
          {options.map((option) => {
            const selected = option.value === value;
            const Icon = option.icon;
            return (
              <Pressable
                key={option.value}
                onPress={() => handleSelect(option.value)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className={cn(
                  'min-h-13 flex-row items-center gap-3 rounded-lg px-3.5',
                  selected ? 'bg-primary-tint' : 'bg-surface-2',
                )}
              >
                {Icon ? (
                  <View
                    className={cn(
                      'h-9 w-9 items-center justify-center rounded-full',
                      selected ? 'bg-surface' : 'bg-surface-3',
                    )}
                  >
                    <Icon
                      size={18}
                      color={selected ? colors.primary : colors.muted}
                      strokeWidth={2}
                    />
                  </View>
                ) : null}
                <Text
                  className={cn(
                    'flex-1 text-[15px] font-semibold tracking-[-0.15px]',
                    selected ? 'text-primary' : 'text-fg',
                  )}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </AppBottomSheet>
    </View>
  );
}
