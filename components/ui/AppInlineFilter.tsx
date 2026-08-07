import { ChevronDown } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppBottomSheet } from '@/components/ui/AppBottomSheet';
import type { PickerOption } from '@/components/ui/AppPicker';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/useAppTheme';
import { cn } from '@/lib/utils';

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
  className?: string;
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
  className,
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
        className={cn(
          'h-9 shrink-0 flex-row items-center gap-1.5 rounded-full pr-3 pl-3.5',
          accent ? 'bg-primary-tint' : 'bg-surface-2',
          disabled && 'opacity-50',
          className,
        )}
        style={style}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Text
          className={cn(
            'text-[12.5px] font-semibold tracking-[-0.125px]',
            accent ? 'text-primary' : 'text-fg',
          )}
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
                  'h-14 flex-row items-center gap-3.5 rounded-full px-3.5',
                  selected ? 'bg-primary-tint' : 'bg-surface-2',
                )}
              >
                {Icon ? (
                  <View
                    className={cn(
                      'h-10 w-10 items-center justify-center rounded-full',
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
    </>
  );
}
