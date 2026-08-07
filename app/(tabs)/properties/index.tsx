import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { Building2 } from 'lucide-react-native';

import { PropertyCard } from '@/components/property/PropertyCard';
import { PropertyFilters } from '@/components/property/PropertyFilters';
import { APP_BOTTOM_SHEET_CLOSE_MS } from '@/components/ui/AppBottomSheet';
import { AppExpandableSearch } from '@/components/ui/AppExpandableSearch';
import { BlurOverlay } from '@/components/ui/BlurOverlay';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FLOATING_ACTIONS_ROW_HEIGHT } from '@/components/ui/FloatingScreenActions';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { listPerformanceProps } from '@/constants/list';
import { useMyMemberships } from '@/hooks/useMembers';
import { useProfile } from '@/hooks/useProfile';
import { useProperties } from '@/hooks/useProperties';
import { useExpandableSearchState } from '@/hooks/useExpandableSearch';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import { useAppTheme } from '@/hooks/useAppTheme';
import { SearchableTabActions } from '@/hooks/useSearchableTabHeader';
import { useTenants } from '@/hooks/useTenants';
import { displayFontFamily } from '@/lib/fonts';
import { useAuthStore } from '@/stores/authStore';
import { useTabBarStore } from '@/stores/tabBarStore';
import { useUiStore } from '@/stores/uiStore';
import type { Language, Property, PropertyType, UsageStatus } from '@/types/app.types';

type TypeFilter = 'all' | PropertyType;
type UsageFilter = 'all' | UsageStatus;

export default function PropertiesScreen() {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const showConfirmDialog = useUiStore((state) => state.showConfirmDialog);
  const showToast = useUiStore((state) => state.showToast);

  const { properties, isLoading, error, refetch, update, remove } = useProperties();
  const { memberships } = useMyMemberships();
  const user = useAuthStore((state) => state.user);
  const { tenants, refetch: refetchTenants } = useTenants();

  useRefetchOnFocus(refetchTenants);
  const { profile } = useProfile();

  const membershipByProperty = useMemo(() => {
    const map = new Map<string, (typeof memberships)[number]>();
    for (const membership of memberships) {
      map.set(membership.property_id, membership);
    }
    return map;
  }, [memberships]);

  const handleCreatePress = useCallback(() => {
    router.push('/property/new');
  }, []);

  const {
    search,
    searchHasText,
    searchExpanded,
    handleSearchPress,
    dismissSearchIfEmpty,
    searchBarControlProps,
    listKeyboardProps,
  } = useExpandableSearchState();

  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [usageFilter, setUsageFilter] = useState<UsageFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const setChromeHidden = useTabBarStore((s) => s.setChromeHidden);

  const handleFilterVisibilityChange = useCallback(
    (open: boolean) => {
      setFilterSheetOpen(open);
      setChromeHidden(open);
    },
    [setChromeHidden],
  );

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

  const objectCount = useMemo(
    () => properties.filter((p) => p.parent_property_id == null).length,
    [properties],
  );

  const renovationCount = useMemo(
    () => properties.filter((p) => p.usage_status === 'in_renovation').length,
    [properties],
  );

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
    (id: string, canArchive: boolean, canDelete: boolean) => {
      if (!canArchive && !canDelete) return null;
      return (
        <View className="mb-3 flex-row items-stretch pl-2">
          {canArchive ? (
            <TouchableOpacity
              className="min-w-22 items-center justify-center px-4"
              style={{ backgroundColor: colors.chart[4] }}
              onPress={() => handleArchive(id)}
            >
              <Text className="text-center text-[11px] font-medium text-white">{t('common.archive')}</Text>
            </TouchableOpacity>
          ) : null}
          {canDelete ? (
            <TouchableOpacity
              className="bg-neg min-w-22 items-center justify-center px-4"
              onPress={() => handleDelete(id)}
            >
              <Text className="text-center text-[11px] font-medium text-white">{t('common.delete')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      );
    },
    [colors.chart, handleArchive, handleDelete, t],
  );

  const handlePropertyPress = useCallback(
    (propertyId: string) => {
      dismissSearchIfEmpty();
      router.push(`/property/${propertyId}`);
    },
    [dismissSearchIfEmpty],
  );

  const renderProperty = useCallback(
    ({ item }: { item: Property }) => {
      const membership = membershipByProperty.get(item.id);
      const canArchive = membership?.role === 'owner' || membership?.role === 'manager';
      const canDelete = item.user_id === user?.id;
      return (
        <Swipeable
          enabled={canArchive || canDelete}
          renderRightActions={() => renderRightActions(item.id, canArchive, canDelete)}
        >
          <PropertyCard
            property={item}
            tenantName={tenantByProperty.get(item.id)}
            currency={currency}
            language={language}
            onPress={handlePropertyPress}
          />
        </Swipeable>
      );
    },
    [
      currency,
      handlePropertyPress,
      language,
      membershipByProperty,
      renderRightActions,
      tenantByProperty,
      user?.id,
    ],
  );

  const searchActive = searchExpanded || searchHasText;

  const listHeader = (
    <View>
      <View style={{ height: FLOATING_ACTIONS_ROW_HEIGHT }} />

      <View className="mb-4">
        <Text className="text-muted mb-2.5 text-[11px] leading-3.5 font-semibold tracking-[1.54px] uppercase">
          {t('properties.objectsUnits', {
            objects: objectCount,
            units: properties.length,
          })}
        </Text>
        <Text
          className="text-fg text-[34px] tracking-[-0.85px]"
          style={{
            fontFamily: displayFontFamily(theme.name),
            lineHeight: 34,
          }}
        >
          {t('properties.title')}
        </Text>
      </View>

      <AppExpandableSearch
        {...searchBarControlProps}
        placeholder={t('properties.searchPlaceholder')}
        className="mb-3"
      />

      <PropertyFilters
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        usageFilter={usageFilter}
        onUsageFilterChange={setUsageFilter}
        onInteraction={dismissSearchIfEmpty}
        onVisibilityChange={handleFilterVisibilityChange}
      />
    </View>
  );

  const listFooter =
    filteredProperties.length > 0 ? (
      <Text className="text-muted mt-4.5 mb-2 text-center text-[10px] font-semibold tracking-[0.8px] uppercase">
        {t('properties.showingOf', {
          shown: filteredProperties.length,
          total: properties.length,
        })}
        {renovationCount > 0
          ? ` · ${t('properties.inPreparation', { count: renovationCount })}`
          : ''}
      </Text>
    ) : null;

  if (isLoading && properties.length === 0) {
    return (
      <View className="flex-1 bg-transparent px-4">
        <SkeletonLoader count={5} height={160} className="mb-4" />
      </View>
    );
  }

  if (error && properties.length === 0) {
    return (
      <View className="flex-1 bg-transparent">
        <ErrorState message={error} onRetry={refetch} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-transparent" collapsable={false}>
      <View className="flex-1" collapsable={false}>
        <FlatList
          className="flex-1"
          contentInsetAdjustmentBehavior="automatic"
          data={filteredProperties}
          keyExtractor={(item) => item.id}
          {...listKeyboardProps}
          {...listPerformanceProps}
          contentContainerStyle={[
            {
              paddingTop: 0,
              paddingHorizontal: theme.spacing.gutter,
              paddingBottom: theme.spacing.scrollBottom,
            },
            filteredProperties.length === 0 ? { flexGrow: 1 } : null,
          ]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={listHeader}
          ListFooterComponent={listFooter}
          renderItem={renderProperty}
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
              onCtaPress={handleCreatePress}
            />
          }
        />
      </View>
      <SearchableTabActions
        showCreate
        onCreatePress={handleCreatePress}
        searchActive={searchActive}
        searchExpanded={searchExpanded}
        onSearchPress={handleSearchPress}
        createAccessibilityLabel={t('properties.addNew')}
      />
      {/* Blur sibling of list — never inside the Modal (see docs/blur). */}
      <BlurOverlay
        visible={filterSheetOpen}
        intensity="strong"
        tint="dark"
        duration={APP_BOTTOM_SHEET_CLOSE_MS}
        zIndex={5}
      />
    </View>
  );
}
