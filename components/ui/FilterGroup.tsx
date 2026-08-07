import type { ReactNode } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { cn } from '@/lib/utils';

type FilterGroupProps = {
  label: string;
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

/** Labeled section inside filter bottom sheets. */
export function FilterGroup({ label, children, className, style }: FilterGroupProps) {
  return (
    <View className={cn('mb-4.5', className)} style={style}>
      <Text className="text-muted mb-2.5 text-[11px] leading-3.5 font-semibold tracking-[1.54px] uppercase">
        {label}
      </Text>
      {children}
    </View>
  );
}
