import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { HelperText, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { CategoryBadge } from '@/components/expense/CategoryBadge';
import { Spacing, Typography } from '@/constants/theme';
import type { ExpenseCategory } from '@/types/app.types';

export interface CategoryChipPickerProps {
  categories: ExpenseCategory[];
  value: string | null;
  onValueChange: (categoryId: string) => void;
  label?: string;
  error?: string;
}

export function CategoryChipPicker({
  categories,
  value,
  onValueChange,
  label,
  error,
}: CategoryChipPickerProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, { color: theme.colors.onSurface }]}>{label}</Text>
      ) : null}

      {categories.length === 0 ? (
        <Text style={[styles.emptyHint, { color: theme.colors.onSurfaceVariant }]}>
          {t('expenses.noCategories')}
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          keyboardShouldPersistTaps="handled"
        >
          {categories.map((category) => {
            const selected = category.id === value;
            return (
              <Pressable
                key={category.id}
                onPress={() => onValueChange(category.id)}
                style={[
                  styles.chip,
                  {
                    borderColor: selected ? theme.colors.primary : theme.colors.outline,
                    borderWidth: selected ? 2 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <CategoryBadge
                  categoryKey={category.key}
                  icon={category.icon}
                  color={category.color}
                />
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {error ? (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Spacing.xs,
  },
  label: {
    ...Typography.labelLarge,
  },
  emptyHint: {
    ...Typography.bodyMedium,
    paddingVertical: Spacing.sm,
  },
  chipRow: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  chip: {
    borderRadius: 999,
  },
});
