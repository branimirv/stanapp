import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

interface PropertyChromeBackdropProps {
  photoUrl?: string | null;
  height: number;
}

/**
 * Optional hero photo under floating chrome. Brand blue wash is global
 * (`ScreenAmbient`); this only adds property imagery when available.
 */
export function PropertyChromeBackdrop({ photoUrl, height }: PropertyChromeBackdropProps) {
  const { isDark } = useAppTheme();

  if (!photoUrl) return null;

  return (
    <View pointerEvents="none" style={[styles.wrap, { height }]}>
      <Image source={{ uri: photoUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient
        colors={
          isDark
            ? ['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,1)']
            : ['rgba(255,255,255,0.05)', 'rgba(248,250,252,0.55)', 'rgba(248,250,252,1)']
        }
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    overflow: 'hidden',
  },
});
