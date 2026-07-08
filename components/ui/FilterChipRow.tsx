import { X } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { Colors, Spacing, Typography } from '@/constants/theme';

export interface FilterChip {
  key: string;
  label: string;
  onClear: () => void;
}

interface FilterChipRowProps {
  chips: FilterChip[];
}

export function FilterChipRow({ chips }: FilterChipRowProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  if (chips.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
      keyboardShouldPersistTaps="handled"
    >
      {chips.map((chip) => (
        <View
          key={chip.key}
          style={[
            styles.chip,
            {
              backgroundColor: theme.dark ? Colors.surfaceVariantDark : Colors.primaryLight,
              borderColor: theme.colors.primary,
            },
          ]}
        >
          <Text style={[styles.chipLabel, { color: theme.colors.primary }]} numberOfLines={1}>
            {chip.label}
          </Text>
          <Pressable
            onPress={chip.onClear}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('expenses.removeFilter', { filter: chip.label })}
          >
            <X size={14} color={theme.colors.primary} strokeWidth={2.5} />
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingLeft: Spacing.sm,
    paddingRight: Spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: 200,
  },
  chipLabel: {
    ...Typography.labelMedium,
    flexShrink: 1,
  },
});
