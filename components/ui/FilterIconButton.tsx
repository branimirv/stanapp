import { SlidersHorizontal } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { HeaderBtnIco } from '@/components/ui/HeaderActionsPill';
import { HEADER_ICON_SIZE } from '@/constants/header';
import { useAppTheme } from '@/hooks/useAppTheme';

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
    <View className="relative">
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
          className="bg-primary absolute -top-0.75 -right-0.75 h-4 min-w-4 items-center justify-center rounded-full px-1"
          pointerEvents="none"
        >
          <Text className="text-on-primary text-[9.5px] font-bold">{activeCount}</Text>
        </View>
      ) : null}
    </View>
  );
}
