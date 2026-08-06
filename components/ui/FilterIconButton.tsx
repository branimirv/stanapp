import { SlidersHorizontal } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { HeaderBtnIco } from '@/components/ui/HeaderActionsPill';
import { HEADER_ICON_SIZE } from '@/constants/header';
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
    <View style={styles.wrap}>
      <HeaderBtnIco
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        active={active}
      >
        <SlidersHorizontal
          size={HEADER_ICON_SIZE}
          color={active ? colors.primary : colors.fg}
          strokeWidth={2}
        />
      </HeaderBtnIco>
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
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
