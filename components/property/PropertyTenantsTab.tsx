import { memo, useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TenantCard } from '@/components/tenant/TenantCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
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
}: PropertyTenantsTabProps) {
  const { t } = useTranslation();

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

  if (isLoading) return <SkeletonLoader count={3} style={styles.content} />;

  if (tenants.length === 0) {
    return (
      <EmptyState
        title={t('empty.noTenants')}
        subtitle={t('empty.noTenantsHint')}
        ctaLabel={canManage ? t('tenants.addNew') : undefined}
        onCtaPress={canManage ? onAddTenant : undefined}
      />
    );
  }

  return (
    <FlatList
      data={tenants}
      keyExtractor={keyExtractor}
      renderItem={renderTenant}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      {...listPerformanceProps}
    />
  );
}

export const PropertyTenantsTab = memo(PropertyTenantsTabComponent);

const styles = StyleSheet.create({
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl + 56,
    gap: Spacing.sm,
  },
});
