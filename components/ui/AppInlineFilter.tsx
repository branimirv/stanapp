import { ChevronDown } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/ui/AppButton';
import type { PickerOption } from '@/components/ui/AppPicker';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { cn } from '@/lib/utils';

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
  const { theme, isDark } = useAppTheme();
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const labelColor = accent ? theme.colors.primary : theme.colors.onSurface;

  const openPicker = useCallback(() => {
    if (disabled) return;
    onOpen?.();
    setModalVisible(true);
  }, [disabled, onOpen]);

  const handleSelect = useCallback(
    (nextValue: T) => {
      onValueChange(nextValue);
      setModalVisible(false);
    },
    [onValueChange],
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
        className={cn('shrink-0 flex-row items-center gap-1 py-1', disabled && 'opacity-50')}
        style={style}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Text
          className={cn('text-base', accent ? 'font-semibold' : 'font-medium')}
          style={{ color: labelColor }}
          numberOfLines={1}
        >
          {prefixLabel ? (
            <>
              <Text className="text-muted-foreground">{prefixLabel} · </Text>
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

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/45">
          <View className="bg-card max-h-[70%] rounded-t-[20px] px-6 pb-8 pt-6">
            <Text className="mb-4 text-center text-base font-medium">
              {title ?? t('common.select')}
            </Text>

            <ScrollView className="mb-4">
              {options.map((option, index) => (
                <View key={option.value}>
                  <Pressable
                    onPress={() => handleSelect(option.value)}
                    className="rounded-lg px-2 py-4"
                    style={
                      option.value === value
                        ? {
                            backgroundColor: isDark
                              ? Colors.surfaceVariantDark
                              : Colors.primaryLight,
                          }
                        : undefined
                    }
                  >
                    <Text
                      className="text-base"
                      style={{
                        color:
                          option.value === value
                            ? theme.colors.primary
                            : theme.colors.onSurface,
                      }}
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
          </View>
        </View>
      </Modal>
    </>
  );
}
