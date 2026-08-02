import { memo, useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TenantCard } from '@/components/tenant/TenantCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { PROPERTY_SCENE_TOP_GAP } from '@/components/property/PropertyTabBar';
import { listPerformanceProps } from '@/constants/list';
import { Spacing } from '@/constants/theme';
import type { Language, Tenant } from '@/types/app.types';

export interface PropertyTenantsTabProps {
  tenants: Tenant[];
  isLoading: boolean;
  canManage: boolean;
  currency: string;
  language: Language;
  refreshing: boolean;
  onRefresh: () => void;
  onSelectTenant: (tenantId: string) => void;
  onAddTenant: () => void;
  /** Clears floating header + tabs; content still peeks under glass. */
  contentTopInset?: number;
}

function keyExtractor(tenant: Tenant) {
  return tenant.id;
}

function PropertyTenantsTabComponent({
  tenants,
  isLoading,
  canManage,
  currency,
  language,
  refreshing,
  onRefresh,
  onSelectTenant,
  onAddTenant,
  contentTopInset = 0,
}: PropertyTenantsTabProps) {
  const { t } = useTranslation();
  const listTopPad = (contentTopInset || 0) + PROPERTY_SCENE_TOP_GAP;

  const renderTenant = useCallback(
    ({ item }: { item: Tenant }) => (
      <TenantCard
        tenant={item}
        currency={currency}
        language={language}
        onPress={onSelectTenant}
      />
    ),
    [currency, language, onSelectTenant],
  );

  if (isLoading) {
    return <SkeletonLoader count={3} style={[styles.content, { paddingTop: listTopPad }]} />;
  }

  if (tenants.length === 0) {
    return (
      <View className="flex-1 px-4" style={{ paddingTop: listTopPad }}>
        <View className="bg-muted/50 rounded-3xl px-2 py-6">
          <EmptyState
            title={t('empty.noTenants')}
            subtitle={t('empty.noTenantsHint')}
            ctaLabel={canManage ? t('tenants.addNew') : undefined}
            onCtaPress={canManage ? onAddTenant : undefined}
          />
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={tenants}
      keyExtractor={keyExtractor}
      renderItem={renderTenant}
      contentContainerStyle={[styles.content, { paddingTop: listTopPad }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      {...listPerformanceProps}
    />
  );
}

export const PropertyTenantsTab = memo(PropertyTenantsTabComponent);

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl + 56,
  },
});
