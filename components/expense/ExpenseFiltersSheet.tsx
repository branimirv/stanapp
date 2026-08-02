import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type {
  RecurringFilter,
  StatusFilter,
  TypeFilter,
} from '@/components/expense/expenseFilterTypes';
import { AppButton } from '@/components/ui/AppButton';
import type { PickerOption } from '@/components/ui/AppPicker';
import { AppSegmentedControl } from '@/components/ui/AppSegmentedControl';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Colors, Spacing } from '@/constants/theme';

export interface ExpenseFiltersSheetProps {
  visible: boolean;
  onDismiss: () => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  propertyFilter: string;
  onPropertyFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  propertyOptions: PickerOption[];
  categoryOptions: PickerOption[];
  recurringFilter: RecurringFilter;
  onRecurringFilterChange: (value: RecurringFilter) => void;
  typeFilter: TypeFilter;
  onTypeFilterChange: (value: TypeFilter) => void;
  onClearFilters: () => void;
}

interface InlineSelectFieldProps {
  options: PickerOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
}

function InlineSelectField({
  options,
  value,
  onValueChange,
  placeholder,
}: InlineSelectFieldProps) {
  const { theme, isDark } = useAppTheme();
  const [expanded, setExpanded] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (nextValue: string) => {
    onValueChange(nextValue);
    setExpanded(false);
  };

  return (
    <View
      style={[styles.selectField, { backgroundColor: isDark ? Colors.surfaceVariantDark : Colors.surface }]}
      className="border-border"
    >
      <Pressable
        onPress={() => setExpanded((current) => !current)}
        style={({ pressed }) => [styles.selectTrigger, { opacity: pressed ? 0.7 : 1 }]}
        accessibilityRole="button"
        accessibilityLabel={selectedOption?.label ?? placeholder}
        accessibilityState={{ expanded }}
      >
        <Text className="text-primary shrink text-base font-semibold" numberOfLines={1}>
          {selectedOption?.label ?? placeholder}
        </Text>
        <ChevronDown
          size={18}
          color={theme.colors.primary}
          strokeWidth={2.5}
          style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
        />
      </Pressable>

      {expanded ? (
        <View style={styles.selectOptions} className="border-border">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <Pressable
                key={option.value}
                onPress={() => handleSelect(option.value)}
                style={({ pressed }) => [styles.optionRow, { opacity: pressed ? 0.7 : 1 }]}
                className={isSelected ? (isDark ? 'bg-secondary' : 'bg-accent') : undefined}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  className={isSelected ? 'text-primary text-base font-semibold' : 'text-foreground text-base'}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

export function ExpenseFiltersSheet({
  visible,
  onDismiss,
  statusFilter,
  onStatusFilterChange,
  propertyFilter,
  onPropertyFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  propertyOptions,
  categoryOptions,
  recurringFilter,
  onRecurringFilterChange,
  typeFilter,
  onTypeFilterChange,
  onClearFilters,
}: ExpenseFiltersSheetProps) {
  const { t } = useTranslation();

  const handleClear = () => {
    onClearFilters();
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable
          style={styles.content}
          className="bg-card"
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.handle} className="bg-border" />

          <Text className="mb-2 text-center text-lg font-medium">
            {t('expenses.filters')}
          </Text>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-muted-foreground mt-1 text-sm font-semibold">
              {t('common.status')}
            </Text>
            <AppSegmentedControl
              segments={[
                { label: t('expenses.filterAll'), value: 'all' },
                { label: t('expenses.filterUnpaid'), value: 'unpaid' },
                { label: t('expenses.filterPaid'), value: 'paid' },
                { label: t('expenses.overdue'), value: 'overdue' },
              ]}
              value={statusFilter}
              onValueChange={(value) => onStatusFilterChange(value as StatusFilter)}
            />

            <Text className="text-muted-foreground mt-1 text-sm font-semibold">
              {t('expenses.property')}
            </Text>
            <InlineSelectField
              options={propertyOptions}
              value={propertyFilter}
              onValueChange={onPropertyFilterChange}
              placeholder={t('expenses.filterByProperty')}
            />

            <Text className="text-muted-foreground mt-1 text-sm font-semibold">
              {t('expenses.category')}
            </Text>
            <InlineSelectField
              options={categoryOptions}
              value={categoryFilter}
              onValueChange={onCategoryFilterChange}
              placeholder={t('expenses.filterByCategory')}
            />

            <Text className="text-muted-foreground mt-1 text-sm font-semibold">
              {t('expenses.frequency')}
            </Text>
            <AppSegmentedControl
              segments={[
                { label: t('common.all'), value: 'all' },
                { label: t('expenses.filterRecurring'), value: 'recurring' },
                { label: t('expenses.filterOneTime'), value: 'one_time' },
              ]}
              value={recurringFilter}
              onValueChange={(value) => onRecurringFilterChange(value as RecurringFilter)}
            />

            <Text className="text-muted-foreground mt-1 text-sm font-semibold">
              {t('expenses.expenseType')}
            </Text>
            <AppSegmentedControl
              segments={[
                { label: t('common.all'), value: 'all' },
                { label: t('expenses.filterRegular'), value: 'regular' },
                { label: t('expenses.filterIrregular'), value: 'irregular' },
              ]}
              value={typeFilter}
              onValueChange={(value) => onTypeFilterChange(value as TypeFilter)}
            />
          </ScrollView>

          <View style={styles.actions}>
            <AppButton mode="text" onPress={handleClear}>
              {t('common.clearFilters')}
            </AppButton>
            <AppButton mode="contained" onPress={onDismiss}>
              {t('common.done')}
            </AppButton>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    maxHeight: '85%',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.sm,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  selectField: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  selectOptions: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  optionRow: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
});
