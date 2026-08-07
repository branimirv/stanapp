import { Pressable, Text, View } from 'react-native';

import { cn } from '@/lib/utils';

export interface FilterOptionChip<T extends string = string> {
  label: string;
  value: T;
}

type FilterOptionChipRowProps<T extends string> = {
  options: FilterOptionChip<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

/** Single-select pill chips for filter sheets (status, type, period presets, …). */
export function FilterOptionChipRow<T extends string>({
  options,
  value,
  onChange,
  className,
}: FilterOptionChipRowProps<T>) {
  return (
    <View className={cn('flex-row flex-wrap gap-2', className)}>
      {options.map((option) => {
        const on = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={cn(
              'h-8.5 items-center justify-center rounded-full px-3.5',
              on ? 'bg-primary-tint' : 'bg-surface-2',
            )}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
          >
            <Text
              className={cn(
                'text-[12.5px] font-semibold tracking-[-0.12px]',
                on ? 'text-primary' : 'text-muted',
              )}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
