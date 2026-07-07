import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/ui/AppButton';
import type { PickerOption } from '@/components/ui/AppPicker';
import { AppSegmentedControl } from '@/components/ui/AppSegmentedControl';
import { Colors, Spacing, Typography } from '@/constants/theme';
import type { ReportCategoryTypeFilter } from '@/types/app.types';

export interface ReportFiltersSheetProps {
  visible: boolean;
  onDismiss: () => void;
  propertyFilter: string;
  onPropertyFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categoryTypeFilter: ReportCategoryTypeFilter;
  onCategoryTypeFilterChange: (value: ReportCategoryTypeFilter) => void;
  propertyOptions: PickerOption[];
  categoryOptions: PickerOption[];
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
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (nextValue: string) => {
    onValueChange(nextValue);
    setExpanded(false);
  };

  return (
    <View
      style={[
        styles.selectField,
        {
          borderColor: theme.colors.outlineVariant,
          backgroundColor: theme.dark ? Colors.surfaceVariantDark : Colors.surface,
        },
      ]}
    >
      <Pressable
        onPress={() => setExpanded((current) => !current)}
        style={({ pressed }) => [styles.selectTrigger, { opacity: pressed ? 0.7 : 1 }]}
        accessibilityRole="button"
        accessibilityLabel={selectedOption?.label ?? placeholder}
        accessibilityState={{ expanded }}
      >
        <Text style={[styles.selectValue, { color: theme.colors.primary }]} numberOfLines={1}>
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
        <View style={styles.selectOptions}>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <Pressable
                key={option.value}
                onPress={() => handleSelect(option.value)}
                style={({ pressed }) => [
                  styles.optionRow,
                  isSelected && {
                    backgroundColor: theme.dark ? Colors.surfaceDark : Colors.primaryLight,
                  },
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  style={[
                    styles.optionLabel,
                    {
                      color: isSelected ? theme.colors.primary : theme.colors.onSurface,
                      fontWeight: isSelected ? '600' : '400',
                    },
                  ]}
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

export function ReportFiltersSheet({
  visible,
  onDismiss,
  propertyFilter,
  onPropertyFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categoryTypeFilter,
  onCategoryTypeFilterChange,
  propertyOptions,
  categoryOptions,
  onClearFilters,
}: ReportFiltersSheetProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const handleClear = () => {
    onClearFilters();
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable
          style={[styles.content, { backgroundColor: theme.colors.surface }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: theme.colors.outlineVariant }]} />

          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {t('reports.filters')}
          </Text>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('reports.filterProperty')}
            </Text>
            <InlineSelectField
              options={propertyOptions}
              value={propertyFilter}
              onValueChange={onPropertyFilterChange}
              placeholder={t('reports.allProperties')}
            />

            <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('reports.filterCategory')}
            </Text>
            <InlineSelectField
              options={categoryOptions}
              value={categoryFilter}
              onValueChange={onCategoryFilterChange}
              placeholder={t('reports.allCategories')}
            />

            <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('reports.filterType')}
            </Text>
            <AppSegmentedControl
              segments={[
                { label: t('reports.typeAll'), value: 'all' },
                { label: t('reports.typeRegular'), value: 'regular' },
                { label: t('reports.typeIrregular'), value: 'irregular' },
              ]}
              value={categoryTypeFilter}
              onValueChange={(value) =>
                onCategoryTypeFilterChange(value as ReportCategoryTypeFilter)
              }
            />

            <Text style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
              {t('reports.expenseFilterHint')}
            </Text>
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
  title: {
    ...Typography.titleMedium,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  sectionLabel: {
    ...Typography.labelLarge,
    marginTop: Spacing.xs,
  },
  hint: {
    ...Typography.bodySmall,
    marginTop: Spacing.sm,
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
  selectValue: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    flexShrink: 1,
  },
  selectOptions: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(148, 163, 184, 0.3)',
  },
  optionRow: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  optionLabel: {
    ...Typography.bodyLarge,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
});
