import { useEffect } from 'react';
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

const INDICATOR_INSET = Spacing.xs / 2;

export function AppSegmentedControl<T extends string = string>({
  segments,
  value,
  onValueChange,
  style,
  disabled = false,
}: AppSegmentedControlProps<T>) {
  const theme = useTheme();
  const segmentCount = Math.max(segments.length, 1);
  const selectedIndex = Math.max(
    0,
    segments.findIndex((segment) => segment.value === value),
  );

  // Position is always derived from (index * segmentWidth) so it cannot drift
  // from the selected value the way an independently set translateX could.
  const indexProgress = useSharedValue(selectedIndex);
  const segmentWidth = useSharedValue(0);

  useEffect(() => {
    // Snap on first layout (width still 0); animate once we have measurements.
    if (segmentWidth.value <= 0) {
      indexProgress.value = selectedIndex;
      return;
    }
    indexProgress.value = withTiming(selectedIndex, { duration: 200 });
  }, [indexProgress, segmentWidth, selectedIndex]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const trackWidth = event.nativeEvent.layout.width;
    const nextWidth = trackWidth / segmentCount;
    const wasUnmeasured = segmentWidth.value <= 0;
    segmentWidth.value = nextWidth;
    // After first measurement, snap to the current selection (covers remounts).
    if (wasUnmeasured) {
      indexProgress.value = selectedIndex;
    }
  };

  const indicatorStyle = useAnimatedStyle(() => {
    const width = segmentWidth.value;
    return {
      width: Math.max(width - INDICATOR_INSET * 2, 0),
      transform: [{ translateX: indexProgress.value * width + INDICATOR_INSET }],
    };
  });

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
            onPress={() => {
              if (disabled) return;
              onValueChange(segment.value);
            }}
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
    padding: INDICATOR_INSET,
    position: 'relative',
    minHeight: 44,
  },
  indicator: {
    position: 'absolute',
    top: INDICATOR_INSET,
    bottom: INDICATOR_INSET,
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
