import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppInlineFilter } from '@/components/ui/AppInlineFilter';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { Spacing } from '@/constants/theme';
import type { PropertyType, UsageStatus } from '@/types/app.types';

type TypeFilter = 'all' | PropertyType;
type UsageFilter = 'all' | UsageStatus;

export interface PropertyFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: TypeFilter;
  onTypeFilterChange: (value: TypeFilter) => void;
  usageFilter: UsageFilter;
  onUsageFilterChange: (value: UsageFilter) => void;
}

export function PropertyFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  usageFilter,
  onUsageFilterChange,
}: PropertyFiltersProps) {
  const { t } = useTranslation();

  const typeOptions = useMemo(
    () => [
      { label: t('properties.allTypes'), value: 'all' as const },
      { label: t('propertyTypes.apartment'), value: 'apartment' as const },
      { label: t('propertyTypes.house'), value: 'house' as const },
      { label: t('propertyTypes.garage'), value: 'garage' as const },
    ],
    [t],
  );

  const usageOptions = useMemo(
    () => [
      { label: t('properties.allUsage'), value: 'all' as const },
      { label: t('usageStatus.rented'), value: 'rented' as const },
      { label: t('usageStatus.personal_use'), value: 'personal_use' as const },
      { label: t('usageStatus.vacant'), value: 'vacant' as const },
    ],
    [t],
  );

  return (
    <View style={styles.container}>
      <AppTextInput
        placeholder={t('properties.searchPlaceholder')}
        value={search}
        onChangeText={onSearchChange}
      />
      <View style={styles.filterRow}>
        <AppInlineFilter
          options={typeOptions}
          value={typeFilter}
          onValueChange={onTypeFilterChange}
          title={t('properties.type')}
          showChevron
          style={styles.typeFilter}
        />
        <AppInlineFilter
          options={usageOptions}
          value={usageFilter}
          onValueChange={onUsageFilterChange}
          title={t('properties.usageStatus')}
          accent
          style={styles.usageFilter}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingTop: Spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    minHeight: 40,
    paddingVertical: Spacing.xs,
  },
  typeFilter: {
    flexShrink: 0,
  },
  usageFilter: {
    flexShrink: 0,
  },
});
