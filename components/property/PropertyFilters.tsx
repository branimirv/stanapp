import {
  Building2,
  DoorOpen,
  House,
  KeyRound,
  LayoutGrid,
  ListFilter,
  User,
  Warehouse,
  Wrench,
} from 'lucide-react-native';
import { useMemo } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppInlineFilter } from '@/components/ui/AppInlineFilter';
import type { PropertyType, UsageStatus } from '@/types/app.types';

type TypeFilter = 'all' | PropertyType;
type UsageFilter = 'all' | UsageStatus;

export interface PropertyFiltersProps {
  typeFilter: TypeFilter;
  onTypeFilterChange: (value: TypeFilter) => void;
  usageFilter: UsageFilter;
  onUsageFilterChange: (value: UsageFilter) => void;
  onInteraction?: () => void;
  onVisibilityChange?: (open: boolean) => void;
}

export function PropertyFilters({
  typeFilter,
  onTypeFilterChange,
  usageFilter,
  onUsageFilterChange,
  onInteraction,
  onVisibilityChange,
}: PropertyFiltersProps) {
  const { t } = useTranslation();

  const typeOptions = useMemo(
    () => [
      { label: t('properties.allTypes'), value: 'all' as const, icon: LayoutGrid },
      { label: t('propertyTypes.apartment'), value: 'apartment' as const, icon: Building2 },
      { label: t('propertyTypes.house'), value: 'house' as const, icon: House },
      { label: t('propertyTypes.garage'), value: 'garage' as const, icon: Warehouse },
    ],
    [t],
  );

  const usageOptions = useMemo(
    () => [
      { label: t('properties.allUsage'), value: 'all' as const, icon: ListFilter },
      { label: t('usageStatus.rented'), value: 'rented' as const, icon: KeyRound },
      { label: t('usageStatus.personal_use'), value: 'personal_use' as const, icon: User },
      { label: t('usageStatus.vacant'), value: 'vacant' as const, icon: DoorOpen },
      { label: t('usageStatus.in_renovation'), value: 'in_renovation' as const, icon: Wrench },
    ],
    [t],
  );

  return (
    <View className="mb-4 flex-row flex-wrap items-center gap-2">
      <AppInlineFilter
        options={typeOptions}
        value={typeFilter}
        onValueChange={onTypeFilterChange}
        title={t('properties.type')}
        accent={typeFilter !== 'all'}
        onOpen={onInteraction}
        onVisibilityChange={onVisibilityChange}
      />
      <AppInlineFilter
        options={usageOptions}
        value={usageFilter}
        onValueChange={onUsageFilterChange}
        title={t('properties.usageStatus')}
        accent={usageFilter !== 'all'}
        onOpen={onInteraction}
        onVisibilityChange={onVisibilityChange}
      />
    </View>
  );
}
