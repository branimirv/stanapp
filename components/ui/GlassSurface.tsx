import { BlurView } from 'expo-blur';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
  type GlassStyle,
} from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import {
  getGlassBlurIntensity,
  getGlassBlurTint,
  getGlassBorderColor,
  getGlassGlossColors,
  getGlassOverlayColor,
} from '@/constants/glass';
import { useAppTheme } from '@/hooks/useAppTheme';

type GlassSurfaceShape = 'pill' | 'circle' | 'rect';

interface GlassSurfaceProps {
  children: ReactNode;
  shape?: GlassSurfaceShape;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  /** Native liquid-glass press response (iOS 26+ only). */
  interactive?: boolean;
  /** Liquid glass style; ignored on the blur fallback. */
  effect?: Exclude<GlassStyle, 'none'>;
}

function borderRadiusForShape(shape: GlassSurfaceShape) {
  if (shape === 'circle' || shape === 'pill') return 999;
  return 12;
}

/** True when native iOS liquid glass can render (API + compile-time support). */
export function canUseLiquidGlass() {
  return (
    Platform.OS === 'ios' &&
    isLiquidGlassAvailable() &&
    isGlassEffectAPIAvailable()
  );
}

/**
 * Frosted chrome surface: native liquid glass on iOS 26+, `BlurView` elsewhere,
 * solid translucent fallback on web.
 */
export function GlassSurface({
  children,
  shape = 'pill',
  style,
  contentStyle,
  interactive = false,
  effect = 'regular',
}: GlassSurfaceProps) {
  const { isDark } = useAppTheme();
  const radius = borderRadiusForShape(shape);
  const useLiquid = canUseLiquidGlass();

  const content = (
    <View
      style={[
        styles.content,
        useLiquid
          ? styles.liquidContent
          : {
              backgroundColor: getGlassOverlayColor(isDark),
              borderColor: getGlassBorderColor(isDark),
              borderWidth: StyleSheet.hairlineWidth,
            },
        { borderRadius: radius },
        contentStyle,
      ]}
    >
      {useLiquid ? null : (
        <LinearGradient
          colors={getGlassGlossColors(isDark)}
          style={[styles.glossHighlight, { borderRadius: radius }]}
          pointerEvents="none"
        />
      )}
      {children}
    </View>
  );

  const radiusStyle = { borderRadius: radius };

  if (useLiquid) {
    // Don't clip the GlassView — overflow:hidden can mute the liquid edge.
    return (
      <GlassView
        style={[radiusStyle, style]}
        glassEffectStyle={effect}
        isInteractive={interactive}
        colorScheme={isDark ? 'dark' : 'light'}
      >
        {content}
      </GlassView>
    );
  }

  const fallbackStyle = [styles.clippedSurface, radiusStyle, style];

  if (Platform.OS === 'web') {
    return <View style={fallbackStyle}>{content}</View>;
  }

  return (
    <BlurView
      intensity={getGlassBlurIntensity(isDark)}
      tint={getGlassBlurTint(isDark)}
      experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
      style={fallbackStyle}
    >
      {content}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  clippedSurface: {
    overflow: 'hidden',
  },
  content: {
    overflow: 'hidden',
  },
  liquidContent: {
    // Liquid glass supplies material + edge; keep the inner layer clear.
    backgroundColor: 'transparent',
  },
  glossHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
  },
});
