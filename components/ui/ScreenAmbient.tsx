import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';

/** Soft brand wash behind every screen — glass chrome needs color to refract. */
export function ScreenAmbient() {
  const { isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const height = insets.top + 220;

  return (
    <View pointerEvents="none" style={[styles.wrap, { height }]}>
      <LinearGradient
        colors={
          isDark
            ? ['rgba(91, 143, 232, 0.22)', 'rgba(91, 143, 232, 0.08)', 'transparent']
            : ['rgba(42, 94, 192, 0.18)', 'rgba(42, 94, 192, 0.08)', 'transparent']
        }
        locations={[0, 0.5, 1]}
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
  },
});
