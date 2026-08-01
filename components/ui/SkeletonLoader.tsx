import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Skeleton } from '@/components/ui/skeleton';
import { Spacing } from '@/constants/theme';
import { cn } from '@/lib/utils';

export interface SkeletonLoaderProps {
  count?: number;
  height?: number;
  width?: number | `${number}%`;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  gap?: number;
  className?: string;
}

export function SkeletonLoader({
  count = 1,
  height = 72,
  width = '100%',
  borderRadius = 12,
  style,
  gap = Spacing.sm,
  className,
}: SkeletonLoaderProps) {
  return (
    <View className={cn('w-full', className)} style={style}>
      {Array.from({ length: count }, (_, index) => (
        <Skeleton
          key={index}
          className="w-full"
          style={{
            height,
            width,
            borderRadius,
            marginBottom: index < count - 1 ? gap : 0,
          }}
        />
      ))}
    </View>
  );
}
