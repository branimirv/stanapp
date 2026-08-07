import { X } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/hooks/useAppTheme';

export interface FilterChip {
  key: string;
  label: string;
  onClear: () => void;
}

interface FilterChipRowProps {
  chips: FilterChip[];
}

/**
 * Naslov `.fchip` row — applied filters with primary outline + clear.
 * Wraps to multiple rows so chips never clip off-screen.
 * See Analitika · filtrirano in naslov-theme.html.
 */
export function FilterChipRow({ chips }: FilterChipRowProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors } = theme;

  if (chips.length === 0) return null;

  return (
    <View className="flex-row flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <View
          key={chip.key}
          className="border-primary bg-primary-tint h-[30px] max-w-full shrink-0 flex-row items-center gap-1.25 rounded-full border py-0 pr-1.5 pl-3"
        >
          <Text
            className="text-primary shrink text-xs font-semibold tracking-[-0.12px]"
            numberOfLines={1}
          >
            {chip.label}
          </Text>
          <Pressable
            onPress={chip.onClear}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('expenses.removeFilter', { filter: chip.label })}
            className="p-0.5"
          >
            <X size={15} color={colors.primary} strokeWidth={2.5} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}
