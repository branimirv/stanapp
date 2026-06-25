import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FAB, useTheme } from 'react-native-paper';
import { Swipeable } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Building2 } from 'lucide-react-native';
import { PropertyCard } from '@/components/property/PropertyCard';
import { AppSegmentedControl } from '@/components/ui/AppSegmentedControl';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useExpenses } from '@/hooks/useExpenses';
import { useProfile } from '@/hooks/useProfile';
import { useProperties } from '@/hooks/useProperties';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import { useTenants } from '@/hooks/useTenants';
import { useUiStore } from '@/stores/uiStore';
import type { Language, PropertyType, UsageStatus } from '@/types/app.types';

type TypeFilter = 'all' | PropertyType;
type UsageFilter = 'all' | UsageStatus;

export default function PropertiesScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const showConfirmDialog = useUiStore((state) => state.showConfirmDialog);
  const showToast = useUiStore((state) => state.showToast);

  const { properties, isLoading, error, refetch, update, remove } = useProperties();
  const { tenants, refetch: refetchTenants } = useTenants();
  const { expenses: overdueExpenses } = useExpenses({ status: 'overdue' });

  useRefetchOnFocus(refetchTenants);
  const { profile } = useProfile();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [usageFilter, setUsageFilter] = useState<UsageFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const language = (profile?.language ?? i18n.language ?? 'hr') as Language;
  const currency = profile?.default_currency ?? 'EUR';

  const tenantByProperty = useMemo(() => {
    const map = new Map<string, string>();
    for (const tenant of tenants) {
      if (tenant.is_active) {
        map.set(tenant.property_id, `${tenant.first_name} ${tenant.last_name}`.trim());
      }
    }
    return map;
  }, [tenants]);

  const overdueByProperty = useMemo(() => {
    const map = new Map<string, number>();
    for (const expense of overdueExpenses) {
      map.set(expense.property_id, (map.get(expense.property_id) ?? 0) + 1);
    }
    return map;
  }, [overdueExpenses]);

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLowerCase();
    return properties.filter((property) => {
      if (typeFilter !== 'all' && property.type !== typeFilter) return false;
      if (usageFilter !== 'all' && property.usage_status !== usageFilter) return false;
      if (!query) return true;
      return (
        property.name.toLowerCase().includes(query) ||
        property.address.toLowerCase().includes(query)
      );
    });
  }, [properties, search, typeFilter, usageFilter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleArchive = useCallback(
    (id: string) => {
      showConfirmDialog({
        title: t('confirm.archivePropertyTitle'),
        message: t('confirm.archivePropertyMessage'),
        confirmLabel: 'common.archive',
        onConfirm: async () => {
          try {
            await update(id, { is_archived: true });
            showToast({ message: t('properties.archiveSuccess'), type: 'success' });
          } catch (err) {
            showToast({
              message: err instanceof Error ? err.message : t('properties.saveFailed'),
              type: 'error',
            });
          }
        },
      });
    },
    [showConfirmDialog, showToast, t, update],
  );

  const handleDelete = useCallback(
    (id: string) => {
      showConfirmDialog({
        title: t('confirm.deletePropertyTitle'),
        message: t('confirm.deletePropertyMessage'),
        confirmLabel: 'common.delete',
        destructive: true,
        onConfirm: async () => {
          try {
            await remove(id);
            showToast({ message: t('properties.deleteSuccess'), type: 'success' });
          } catch (err) {
            showToast({
              message: err instanceof Error ? err.message : t('properties.deleteFailed'),
              type: 'error',
            });
          }
        },
      });
    },
    [remove, showConfirmDialog, showToast, t],
  );

  const renderRightActions = useCallback(
    (id: string) => (
      <View style={styles.swipeActions}>
        <TouchableOpacity
          style={[styles.swipeButton, styles.swipeArchive]}
          onPress={() => handleArchive(id)}
        >
          <Text style={styles.swipeLabel}>{t('common.archive')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeButton, styles.swipeDelete]}
          onPress={() => handleDelete(id)}
        >
          <Text style={styles.swipeLabel}>{t('common.delete')}</Text>
        </TouchableOpacity>
      </View>
    ),
    [handleArchive, handleDelete, t],
  );

  if (isLoading && properties.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <SkeletonLoader count={5} height={140} style={styles.skeleton} />
      </View>
    );
  }

  if (error && properties.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorState message={error} onRetry={refetch} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={filteredProperties}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredProperties.length === 0 && styles.listEmpty,
          { paddingBottom: insets.bottom + 88 },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.filters}>
            <AppTextInput
              placeholder={t('properties.searchPlaceholder')}
              value={search}
              onChangeText={setSearch}
            />
            <AppSegmentedControl
              segments={[
                { label: t('properties.allTypes'), value: 'all' },
                { label: t('propertyTypes.apartment'), value: 'apartment' },
                { label: t('propertyTypes.house'), value: 'house' },
                { label: t('propertyTypes.garage'), value: 'garage' },
              ]}
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as TypeFilter)}
              style={styles.segment}
            />
            <AppSegmentedControl
              segments={[
                { label: t('properties.allUsage'), value: 'all' },
                { label: t('usageStatus.rented'), value: 'rented' },
                { label: t('usageStatus.personal_use'), value: 'personal_use' },
                { label: t('usageStatus.vacant'), value: 'vacant' },
              ]}
              value={usageFilter}
              onValueChange={(value) => setUsageFilter(value as UsageFilter)}
            />
          </View>
        }
        renderItem={({ item }) => (
          <Swipeable renderRightActions={() => renderRightActions(item.id)}>
            <PropertyCard
              property={item}
              tenantName={tenantByProperty.get(item.id)}
              overdueCount={overdueByProperty.get(item.id) ?? 0}
              currency={currency}
              language={language}
            />
          </Swipeable>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={Building2}
            title={t('empty.noProperties')}
            subtitle={
              search || typeFilter !== 'all' || usageFilter !== 'all'
                ? t('empty.noResultsHint')
                : t('empty.noPropertiesHint')
            }
            ctaLabel={t('properties.addNew')}
            onCtaPress={() => router.push('/property/new')}
          />
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        onPress={() => router.push('/property/new')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skeleton: {
    padding: Spacing.md,
  },
  listContent: {
    padding: Spacing.md,
    paddingTop: 0,
  },
  listEmpty: {
    flexGrow: 1,
  },
  filters: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingTop: Spacing.md,
  },
  segment: {
    marginBottom: Spacing.xs,
  },
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingLeft: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  swipeButton: {
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    minWidth: 88,
  },
  swipeArchive: {
    backgroundColor: '#F59E0B',
  },
  swipeDelete: {
    backgroundColor: '#EF4444',
  },
  swipeLabel: {
    ...Typography.labelMedium,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
  },
});
