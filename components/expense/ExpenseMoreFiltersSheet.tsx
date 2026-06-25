import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/ui/AppButton';
import { AppSegmentedControl } from '@/components/ui/AppSegmentedControl';
import { Spacing, Typography } from '@/constants/theme';
import type { ExpenseType } from '@/types/app.types';

export type RecurringFilter = 'all' | 'recurring' | 'one_time';
export type TypeFilter = 'all' | ExpenseType;

export interface ExpenseMoreFiltersSheetProps {
  visible: boolean;
  onDismiss: () => void;
  recurringFilter: RecurringFilter;
  onRecurringFilterChange: (value: RecurringFilter) => void;
  typeFilter: TypeFilter;
  onTypeFilterChange: (value: TypeFilter) => void;
  onClearFilters: () => void;
}

export function ExpenseMoreFiltersSheet({
  visible,
  onDismiss,
  recurringFilter,
  onRecurringFilterChange,
  typeFilter,
  onTypeFilterChange,
  onClearFilters,
}: ExpenseMoreFiltersSheetProps) {
  const theme = useTheme();
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
          style={[styles.content, { backgroundColor: theme.colors.surface }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: theme.colors.outlineVariant }]} />

          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {t('expenses.moreFilters')}
          </Text>

          <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
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

          <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
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
    gap: Spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.titleMedium,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  sectionLabel: {
    ...Typography.labelLarge,
    marginTop: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
});
