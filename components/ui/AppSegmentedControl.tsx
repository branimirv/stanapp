import { useEffect } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Fonts } from '@/lib/fonts';
import { cn } from '@/lib/utils';

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
  className?: string;
  /**
   * `nav` — glass track + sliding indicator (detail tabs).
   * `picker` — Naslov `.segs.picker`: solid primary fill on selection.
   */
  variant?: 'nav' | 'picker';
}

const INDICATOR_INSET = Spacing.xs / 2;

export function AppSegmentedControl<T extends string = string>({
  segments,
  value,
  onValueChange,
  style,
  disabled = false,
  className,
  variant = 'nav',
}: AppSegmentedControlProps<T>) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const segmentCount = Math.max(segments.length, 1);
  const selectedIndex = Math.max(
    0,
    segments.findIndex((segment) => segment.value === value),
  );

  const indexProgress = useSharedValue(selectedIndex);
  const segmentWidth = useSharedValue(0);

  useEffect(() => {
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

  if (variant === 'picker') {
    return (
      <View
        style={[
          styles.pickerTrack,
          {
            backgroundColor: colors.surface2,
            opacity: disabled ? 0.6 : 1,
          },
          style,
        ]}
        className={className}
      >
        {segments.map((segment) => {
          const isSelected = segment.value === value;
          return (
            <Pressable
              key={segment.value}
              style={[
                styles.pickerSeg,
                isSelected ? { backgroundColor: colors.primary } : null,
              ]}
              onPress={() => {
                if (disabled) return;
                onValueChange(segment.value);
              }}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected, disabled }}
            >
              <Text
                style={{
                  fontFamily: Fonts.sans.semibold,
                  fontSize: 12,
                  letterSpacing: -0.12,
                  color: isSelected ? colors.onPrimary : colors.muted,
                  textAlign: 'center',
                }}
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

  return (
    <GlassSurface
      shape="pill"
      interactive
      style={style}
      contentStyle={{ minHeight: 44, opacity: disabled ? 0.6 : 1 }}
    >
      <View className={cn('relative min-h-11 flex-row p-0.5', className)} onLayout={handleLayout}>
        <Animated.View
          className="bg-primary/90 absolute bottom-0.5 top-0.5 rounded-full"
          style={indicatorStyle}
        />

        {segments.map((segment) => {
          const isSelected = segment.value === value;

          return (
            <Pressable
              key={segment.value}
              className="z-1 flex-1 items-center justify-center px-2 py-2"
              onPress={() => {
                if (disabled) return;
                onValueChange(segment.value);
              }}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected, disabled }}
            >
              <Text
                className={cn(
                  'text-center text-sm',
                  isSelected
                    ? 'text-primary-foreground font-semibold'
                    : 'text-foreground/80 font-medium',
                )}
                numberOfLines={1}
              >
                {segment.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  pickerTrack: {
    flexDirection: 'row',
    gap: 5,
    padding: 4,
    borderRadius: 999,
    minHeight: 40,
  },
  pickerSeg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 999,
  },
});
