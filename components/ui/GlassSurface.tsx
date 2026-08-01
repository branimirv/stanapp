import { BlurView } from 'expo-blur';
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
}

function borderRadiusForShape(shape: GlassSurfaceShape) {
  if (shape === 'circle') return 999;
  if (shape === 'pill') return 999;
  return 12;
}

export function GlassSurface({
  children,
  shape = 'pill',
  style,
  contentStyle,
}: GlassSurfaceProps) {
  const { isDark } = useAppTheme();
  const radius = borderRadiusForShape(shape);

  const overlay = (
    <View
      style={[
        styles.overlay,
        {
          borderRadius: radius,
          backgroundColor: getGlassOverlayColor(isDark),
          borderColor: getGlassBorderColor(isDark),
        },
        contentStyle,
      ]}
    >
      <LinearGradient
        colors={getGlassGlossColors(isDark)}
        style={[styles.glossHighlight, { borderRadius: radius }]}
        pointerEvents="none"
      />
      {children}
    </View>
  );

  const blurStyle = [styles.blur, { borderRadius: radius }, style];

  if (Platform.OS === 'web') {
    return <View style={blurStyle}>{overlay}</View>;
  }

  return (
    <BlurView
      intensity={getGlassBlurIntensity(isDark)}
      tint={getGlassBlurTint(isDark)}
      experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
      style={blurStyle}
    >
      {overlay}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blur: {
    overflow: 'hidden',
  },
  overlay: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  glossHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
  },
});
