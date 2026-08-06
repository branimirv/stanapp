import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
  useColorScheme,
} from 'react-native';
import { BlurView } from 'expo-blur';

export type BlurIntensity = 'none' | 'subtle' | 'light' | 'medium' | 'strong' | 'max';
export type BlurTint = 'light' | 'dark' | 'default' | 'auto';

export interface BlurOverlayProps {
  /** Controls mount + fade. The overlay stays mounted while fading out. */
  visible: boolean;
  /** Named preset or a raw 0-100 value. Presets are recommended. */
  intensity?: BlurIntensity | number;
  /** `auto` follows the system color scheme. */
  tint?: BlurTint;
  /** Fade duration in ms. */
  duration?: number;
  /** Called when the (non-blurred) scrim area is pressed. Enables touch capture. */
  onPress?: () => void;
  /** Extra dim layered on top of the blur, 0-1. Useful on Android where blur reads weaker. */
  dim?: number;
  /** Render above this overlay's siblings. Default 10. */
  zIndex?: number;
  style?: ViewStyle;
  /** Escape hatch: force the non-blur fallback (solid translucent scrim). */
  forceFallback?: boolean;
  children?: React.ReactNode;
  testID?: string;
}

const PRESET_BASE: Record<BlurIntensity, number> = {
  none: 0,
  subtle: 12,
  light: 25,
  medium: 45,
  strong: 70,
  max: 100,
};

const PRESET_DIM: Record<BlurIntensity, number> = {
  none: 0,
  subtle: 0.02,
  light: 0.04,
  medium: 0.06,
  strong: 0.08,
  max: 0.1,
};

const PLATFORM_SCALE = Platform.select({ ios: 1, android: 1.35, default: 1.15 })!;
const PLATFORM_DIM_BOOST = Platform.select({ ios: 0, android: 0.06, default: 0.02 })!;

const ANDROID_SUPPORTS_BLUR = Platform.OS !== 'android' || Number(Platform.Version) >= 31;

export function resolveIntensity(intensity: BlurIntensity | number): {
  value: number;
  dim: number;
} {
  if (typeof intensity === 'number') {
    const clamped = Math.max(0, Math.min(100, intensity));
    return {
      value: Math.min(100, Math.round(clamped * PLATFORM_SCALE)),
      dim: PLATFORM_DIM_BOOST * (clamped / 100),
    };
  }
  const base = PRESET_BASE[intensity] ?? PRESET_BASE.medium;
  return {
    value: Math.min(100, Math.round(base * PLATFORM_SCALE)),
    dim: PRESET_DIM[intensity] + PLATFORM_DIM_BOOST * (base / 100),
  };
}

export function BlurOverlay({
  visible,
  intensity = 'medium',
  tint = 'auto',
  duration = 220,
  onPress,
  dim,
  zIndex = 10,
  style,
  forceFallback = false,
  children,
  testID = 'blur-overlay',
}: BlurOverlayProps) {
  const scheme = useColorScheme();
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) setMounted(true);

    const animation = Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration,
      easing: visible ? Easing.out(Easing.quad) : Easing.in(Easing.quad),
      useNativeDriver: true,
    });

    animation.start(({ finished }) => {
      if (finished && !visible) setMounted(false);
    });

    return () => animation.stop();
  }, [visible, duration, opacity]);

  const resolvedTint = tint === 'auto' ? (scheme === 'dark' ? 'dark' : 'light') : tint;
  const { value, dim: autoDim } = useMemo(() => resolveIntensity(intensity), [intensity]);
  const effectiveDim = dim ?? autoDim;
  const useFallback = forceFallback || !ANDROID_SUPPORTS_BLUR;

  if (!mounted || value === 0) return null;

  const dimColor =
    resolvedTint === 'dark'
      ? `rgba(0,0,0,${useFallback ? Math.min(0.6, 0.25 + value / 200) : effectiveDim})`
      : `rgba(255,255,255,${useFallback ? Math.min(0.75, 0.3 + value / 200) : effectiveDim})`;

  return (
    <Animated.View
      testID={testID}
      pointerEvents={onPress ? 'auto' : 'none'}
      style={[StyleSheet.absoluteFill, { opacity, zIndex }, style]}
    >
      {!useFallback && (
        <BlurView
          intensity={value}
          tint={resolvedTint}
          blurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
          blurReductionFactor={4}
          style={StyleSheet.absoluteFill}
        />
      )}

      <View style={[StyleSheet.absoluteFill, { backgroundColor: dimColor }]} />

      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          onPress={onPress}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      {children}
    </Animated.View>
  );
}

interface BlurOverlayController {
  show: (options?: { intensity?: BlurIntensity | number; tint?: BlurTint }) => void;
  hide: () => void;
  visible: boolean;
}

const BlurOverlayContext = createContext<BlurOverlayController | null>(null);

export function BlurOverlayProvider({
  children,
  defaultIntensity = 'medium',
}: {
  children: React.ReactNode;
  defaultIntensity?: BlurIntensity | number;
}) {
  const [visible, setVisible] = useState(false);
  const [intensity, setIntensity] = useState<BlurIntensity | number>(defaultIntensity);
  const [tint, setTint] = useState<BlurTint>('auto');

  const show = useCallback<BlurOverlayController['show']>((options) => {
    if (options?.intensity !== undefined) setIntensity(options.intensity);
    if (options?.tint !== undefined) setTint(options.tint);
    setVisible(true);
  }, []);

  const hide = useCallback(() => setVisible(false), []);
  const controller = useMemo(() => ({ show, hide, visible }), [show, hide, visible]);

  return (
    <BlurOverlayContext.Provider value={controller}>
      <View style={styles.flex}>
        {children}
        <BlurOverlay visible={visible} intensity={intensity} tint={tint} zIndex={999} />
      </View>
    </BlurOverlayContext.Provider>
  );
}

export function useBlurOverlay(): BlurOverlayController {
  const ctx = useContext(BlurOverlayContext);
  if (!ctx) throw new Error('useBlurOverlay must be used inside a <BlurOverlayProvider>.');
  return ctx;
}

const styles = StyleSheet.create({ flex: { flex: 1 } });

export default BlurOverlay;
