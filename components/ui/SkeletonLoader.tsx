import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from 'react-native-paper';
import { Colors, Spacing } from '@/constants/theme';

export interface SkeletonLoaderProps {
  count?: number;
  height?: number;
  width?: number | `${number}%`;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  gap?: number;
}

function SkeletonItem({
  height,
  width,
  borderRadius,
  style,
}: {
  height: number;
  width: number | `${number}%`;
  borderRadius: number;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const shimmerProgress = useSharedValue(0);

  const baseColor =
    theme.dark ? Colors.surfaceVariantDark : Colors.surfaceVariant;
  const highlightColor = theme.dark ? Colors.borderDark : Colors.border;

  useEffect(() => {
    shimmerProgress.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [shimmerProgress]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + shimmerProgress.value * 0.65,
  }));

  return (
    <View
      style={[
        styles.item,
        {
          height,
          width,
          borderRadius,
          backgroundColor: baseColor,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: highlightColor, borderRadius },
          shimmerStyle,
        ]}
      />
    </View>
  );
}

export function SkeletonLoader({
  count = 1,
  height = 72,
  width = '100%',
  borderRadius = 12,
  style,
  gap = Spacing.sm,
}: SkeletonLoaderProps) {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonItem
          key={index}
          height={height}
          width={width}
          borderRadius={borderRadius}
          style={index < count - 1 ? { marginBottom: gap } : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  item: {
    overflow: 'hidden',
  },
});
