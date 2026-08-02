import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PeriodFilter } from '@/components/reports/PeriodFilter';
import { AppButton } from '@/components/ui/AppButton';
import type { PickerOption } from '@/components/ui/AppPicker';
import { AppSegmentedControl } from '@/components/ui/AppSegmentedControl';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Colors, Spacing } from '@/constants/theme';
import type { ReportCategoryTypeFilter, ReportPeriod } from '@/types/app.types';

export interface ReportFiltersSheetProps {
  visible: boolean;
  onDismiss: () => void;
  period: ReportPeriod;
  onPeriodChange: (period: ReportPeriod) => void;
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

export function ReportFiltersSheet({
  visible,
  onDismiss,
  period,
  onPeriodChange,
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
  const { t } = useTranslation();

  const handleClear = () => {
    onClearFilters();
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable
          style={styles.content}
          className="bg-card"
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.handle} className="bg-border" />

          <Text className="mb-2 text-center text-lg font-medium">{t('reports.filters')}</Text>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-muted-foreground mt-1 text-sm font-semibold">
              {t('reports.periodFilter')}
            </Text>
            <PeriodFilter value={period} onChange={onPeriodChange} style={styles.periodFilter} />

            <Text className="text-muted-foreground mt-1 text-sm font-semibold">
              {t('reports.filterProperty')}
            </Text>
            <InlineSelectField
              options={propertyOptions}
              value={propertyFilter}
              onValueChange={onPropertyFilterChange}
              placeholder={t('reports.allProperties')}
            />

            <Text className="text-muted-foreground mt-1 text-sm font-semibold">
              {t('reports.filterCategory')}
            </Text>
            <InlineSelectField
              options={categoryOptions}
              value={categoryFilter}
              onValueChange={onCategoryFilterChange}
              placeholder={t('reports.allCategories')}
            />

            <Text className="text-muted-foreground mt-1 text-sm font-semibold">
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

            <Text className="text-muted-foreground mt-2 text-sm">
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
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  periodFilter: {
    marginBottom: 0,
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
