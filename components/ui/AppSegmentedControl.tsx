import { useCallback } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Text, useTheme } from 'react-native-paper';
import { Spacing, Typography } from '@/constants/theme';

export interface SegmentedOption<T extends string = string> {
  label: string;
  value: T;
}

export interface AppSegmentedControlProps<T extends string = string> {
  segments: SegmentedOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export function AppSegmentedControl<T extends string = string>({
  segments,
  value,
  onValueChange,
  style,
  disabled = false,
}: AppSegmentedControlProps<T>) {
  const theme = useTheme();
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const segmentWidth = useSharedValue(0);

  const selectedIndex = segments.findIndex((segment) => segment.value === value);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const totalWidth = event.nativeEvent.layout.width;
      const width = totalWidth / Math.max(segments.length, 1);
      segmentWidth.value = width;
      indicatorWidth.value = width - Spacing.xs;
      indicatorX.value = withTiming(selectedIndex * width + Spacing.xs / 2, {
        duration: 200,
      });
    },
    [indicatorWidth, indicatorX, segmentWidth, segments.length, selectedIndex],
  );

  const handleSelect = useCallback(
    (index: number, nextValue: T) => {
      if (disabled) return;
      onValueChange(nextValue);
      indicatorX.value = withTiming(index * segmentWidth.value + Spacing.xs / 2, {
        duration: 200,
      });
    },
    [disabled, indicatorX, onValueChange, segmentWidth],
  );

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  const trackColor = theme.colors.surfaceVariant;
  const indicatorColor = theme.colors.surface;

  return (
    <View
      style={[
        styles.track,
        { backgroundColor: trackColor, opacity: disabled ? 0.6 : 1 },
        style,
      ]}
      onLayout={handleLayout}
    >
      <Animated.View
        style={[
          styles.indicator,
          { backgroundColor: indicatorColor },
          indicatorStyle,
        ]}
      />

      {segments.map((segment, index) => {
        const isSelected = segment.value === value;

        return (
          <Pressable
            key={segment.value}
            style={styles.segment}
            onPress={() => handleSelect(index, segment.value)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected, disabled }}
          >
            <Text
              style={[
                styles.segmentLabel,
                {
                  color: isSelected
                    ? theme.colors.primary
                    : theme.colors.onSurfaceVariant,
                  fontWeight: isSelected ? '600' : '500',
                },
              ]}
              numberOfLines={1}
            >
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: Spacing.xs / 2,
    position: 'relative',
    minHeight: 44,
  },
  indicator: {
    position: 'absolute',
    top: Spacing.xs / 2,
    bottom: Spacing.xs / 2,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    zIndex: 1,
  },
  segmentLabel: {
    ...Typography.labelLarge,
    textAlign: 'center',
  },
});
