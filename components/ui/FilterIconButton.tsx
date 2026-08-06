import { SlidersHorizontal } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { Fonts } from '@/lib/fonts';

interface FilterIconButtonProps {
  activeCount?: number;
  onPress: () => void;
  accessibilityLabel: string;
}

/**
 * Naslov filter trigger — `.btn-ico` / `.btn-ico.on` + `.fcount`
 * (see Analitika · filtrirano in naslov-theme.html).
 */
export function FilterIconButton({
  activeCount = 0,
  onPress,
  accessibilityLabel,
}: FilterIconButtonProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const active = activeCount > 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: active }}
      style={[
        styles.btnIco,
        {
          backgroundColor: active ? colors.primaryTint : colors.surface2,
        },
      ]}
      hitSlop={4}
    >
      <SlidersHorizontal
        size={17}
        color={active ? colors.primary : colors.fg}
        strokeWidth={2}
      />
      {active ? (
        <View
          style={[styles.fcount, { backgroundColor: colors.primary }]}
          pointerEvents="none"
        >
          <Text
            style={{
              fontFamily: Fonts.sans.bold,
              fontSize: 9.5,
              color: colors.onPrimary,
            }}
          >
            {activeCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btnIco: {
    position: 'relative',
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fcount: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
