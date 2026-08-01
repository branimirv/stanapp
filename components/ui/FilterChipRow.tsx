import { X } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

export interface FilterChip {
  key: string;
  label: string;
  onClear: () => void;
}

interface FilterChipRowProps {
  chips: FilterChip[];
}

export function FilterChipRow({ chips }: FilterChipRowProps) {
  const { isDark } = useAppTheme();
  const { t } = useTranslation();

  if (chips.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="flex-row gap-1 py-1"
      keyboardShouldPersistTaps="handled"
    >
      {chips.map((chip) => (
        <View
          key={chip.key}
          className="max-w-50 flex-row items-center gap-1 rounded-2xl border px-1 py-1 pl-2"
          style={{
            backgroundColor: isDark ? Colors.surfaceVariantDark : Colors.primaryLight,
            borderColor: Colors.primary,
          }}
        >
          <Text className="shrink text-xs font-medium" style={{ color: Colors.primary }} numberOfLines={1}>
            {chip.label}
          </Text>
          <Pressable
            onPress={chip.onClear}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('expenses.removeFilter', { filter: chip.label })}
          >
            <X size={14} color={Colors.primary} strokeWidth={2.5} />
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}
