import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CategoryBadge } from '@/components/expense/CategoryBadge';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import type { ExpenseCategory } from '@/types/app.types';

export interface CategoryChipPickerProps {
  categories: ExpenseCategory[];
  value: string | null;
  onValueChange: (categoryId: string) => void;
  onAddCustom?: () => void;
  label?: string;
  error?: string;
}

export function CategoryChipPicker({
  categories,
  value,
  onValueChange,
  onAddCustom,
  label,
  error,
}: CategoryChipPickerProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {label ? <Text className="text-sm font-semibold">{label}</Text> : null}

      {categories.length === 0 && !onAddCustom ? (
        <Text className="text-muted-foreground py-2 text-base">
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
                    borderColor: selected ? category.color : 'transparent',
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <CategoryBadge
                  categoryKey={category.key}
                  categoryName={category.name}
                  icon={category.icon}
                  color={category.color}
                />
              </Pressable>
            );
          })}
          {onAddCustom ? (
            <Pressable
              onPress={onAddCustom}
              className="border-primary"
              style={styles.addCustomChip}
              accessibilityRole="button"
              accessibilityLabel={t('expenses.addCustomCategory')}
            >
              <Text className="text-primary text-xs font-semibold">
                + {t('expenses.addCustomCategory')}
              </Text>
            </Pressable>
          ) : null}
        </ScrollView>
      )}

      {error ? <Text className="text-destructive text-sm">{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Spacing.xs,
  },
  chipRow: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 2,
  },
  addCustomChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
