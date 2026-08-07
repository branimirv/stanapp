import { useMemo, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { PeriodFilter } from '@/components/reports/PeriodFilter';
import { AppBottomSheet } from '@/components/ui/AppBottomSheet';
import { AppPicker, type PickerOption } from '@/components/ui/AppPicker';
import { useEarliestReportActivity } from '@/hooks/useEarliestReportActivity';
import { cn } from '@/lib/utils';
import type { ReportCategoryTypeFilter, ReportPeriod } from '@/types/app.types';

export interface ReportFiltersSheetProps {
  visible: boolean;
  onDismiss: () => void;
  period: ReportPeriod;
  onPeriodChange: (period: ReportPeriod) => void;
  /** Used to re-seed custom period Od when property pills change. */
  propertyFilter: string;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categoryTypeFilter: ReportCategoryTypeFilter;
  onCategoryTypeFilterChange: (value: ReportCategoryTypeFilter) => void;
  categoryOptions: PickerOption[];
  onClearFilters: () => void;
}

interface FilterChipOption<T extends string> {
  label: string;
  value: T;
}

function FilterChipRow<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: FilterChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <View className={cn('flex-row flex-wrap gap-2', className)}>
      {options.map((option) => {
        const on = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={cn(
              'h-8.5 items-center justify-center rounded-full px-3.5',
              on ? 'bg-primary-tint' : 'bg-surface-2',
            )}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
          >
            <Text
              className={cn(
                'text-[12.5px] font-semibold tracking-[-0.12px]',
                on ? 'text-primary' : 'text-muted',
              )}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function FilterGroup({
  label,
  children,
  className,
  style,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View className={cn('mb-4.5', className)} style={style}>
      <Text className="text-muted mb-2.5 text-[11px] leading-3.5 font-semibold tracking-[1.54px] uppercase">
        {label}
      </Text>
      {children}
    </View>
  );
}

/** Naslov report filters — BlurOverlay must be a sibling on the host screen. */
export function ReportFiltersSheet({
  visible,
  onDismiss,
  period,
  onPeriodChange,
  propertyFilter,
  categoryFilter,
  onCategoryFilterChange,
  categoryTypeFilter,
  onCategoryTypeFilterChange,
  categoryOptions,
  onClearFilters,
}: ReportFiltersSheetProps) {
  const { t } = useTranslation();
  const { earliestActivityDate } = useEarliestReportActivity(propertyFilter);

  const activeCount = useMemo(() => {
    let count = 0;
    if (period.preset !== 'last_6_months') count += 1;
    if (categoryFilter !== 'all') count += 1;
    if (categoryTypeFilter !== 'all') count += 1;
    return count;
  }, [categoryFilter, categoryTypeFilter, period.preset]);

  const typeOptions: FilterChipOption<ReportCategoryTypeFilter>[] = [
    { label: t('reports.typeAll'), value: 'all' },
    { label: t('reports.typeRegular'), value: 'regular' },
    { label: t('reports.typeIrregular'), value: 'irregular' },
  ];

  const handleClear = () => {
    onClearFilters();
    onDismiss();
  };

  const doneLabel =
    activeCount > 0 ? `${t('common.done')} ${activeCount}` : t('common.done');

  return (
    <AppBottomSheet visible={visible} onDismiss={onDismiss} title={t('reports.filters')}>
      <ScrollView
        className="max-h-105 grow-0"
        contentContainerClassName="pb-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <FilterGroup label={t('reports.periodFilter')}>
          <PeriodFilter
            value={period}
            onChange={onPeriodChange}
            propertyFilter={propertyFilter}
            earliestActivityDate={earliestActivityDate}
          />
        </FilterGroup>

        <FilterGroup label={t('reports.filterCategory')}>
          <AppPicker
            options={categoryOptions}
            value={categoryFilter}
            onValueChange={onCategoryFilterChange}
            placeholder={t('reports.allCategories')}
          />
        </FilterGroup>

        <FilterGroup label={t('reports.filterType')} className="mb-2.5">
          <FilterChipRow
            options={typeOptions}
            value={categoryTypeFilter}
            onChange={onCategoryTypeFilterChange}
          />
        </FilterGroup>

        <Text className="text-muted mb-5.5 text-[11.5px] leading-4.5">
          {t('reports.expenseFilterHint')}
        </Text>
      </ScrollView>

      <View className="flex-row gap-2.25">
        <Pressable
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel={t('common.clearFilters')}
          className="bg-surface-2 h-11 flex-1 flex-row items-center justify-center gap-1.5 rounded-full px-4"
        >
          <Text className="text-fg text-sm font-semibold tracking-[-0.14px]" numberOfLines={1}>
            {t('common.clearFilters')}
          </Text>
        </Pressable>

        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel={doneLabel}
          className="bg-primary h-11 flex-2 flex-row items-center justify-center gap-1.5 rounded-full px-4"
        >
          <Text className="text-on-primary text-sm font-semibold tracking-[-0.14px]">
            {doneLabel}
          </Text>
        </Pressable>
      </View>
    </AppBottomSheet>
  );
}
