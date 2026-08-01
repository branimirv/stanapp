import { memo, useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MonthlyGrid } from '@/components/rent/MonthlyGrid';
import { RentPaymentCard } from '@/components/rent/RentPaymentCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { listPerformanceProps } from '@/constants/list';
import { Spacing } from '@/constants/theme';
import type { Language, RentPayment, Tenant } from '@/types/app.types';

export interface PropertyRentTabProps {
  rentPayments: RentPayment[];
  tenantMap: Map<string, Tenant>;
  year: number;
  isLoading: boolean;
  canManage: boolean;
  currency: string;
  language: Language;
  refreshing: boolean;
  onRefresh: () => void;
  onMonthPress: (month: number, payment?: RentPayment) => void;
  onAddPayment: () => void;
}

function keyExtractor(payment: RentPayment) {
  return payment.id;
}

function PropertyRentTabComponent({
  rentPayments,
  tenantMap,
  year,
  isLoading,
  canManage,
  currency,
  language,
  refreshing,
  onRefresh,
  onMonthPress,
  onAddPayment,
}: PropertyRentTabProps) {
  const { t } = useTranslation();

  const renderPayment = useCallback(
    ({ item }: { item: RentPayment }) => {
      const tenant = tenantMap.get(item.tenant_id);
      return (
        <RentPaymentCard
          payment={item}
          tenantName={tenant ? `${tenant.first_name} ${tenant.last_name}` : undefined}
          currency={currency}
          language={language}
        />
      );
    },
    [currency, language, tenantMap],
  );

  if (isLoading) return <SkeletonLoader count={3} style={styles.content} />;

  return (
    <FlatList
      data={rentPayments}
      keyExtractor={keyExtractor}
      renderItem={renderPayment}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      {...listPerformanceProps}
      ListHeaderComponent={
        <MonthlyGrid
          payments={rentPayments}
          year={year}
          language={language}
          onMonthPress={onMonthPress}
        />
      }
      ListEmptyComponent={
        <EmptyState
          title={t('empty.noRentPayments')}
          subtitle={t('empty.noRentPaymentsHint')}
          ctaLabel={canManage ? t('rent.addPayment') : undefined}
          onCtaPress={canManage ? onAddPayment : undefined}
        />
      }
    />
  );
}

export const PropertyRentTab = memo(PropertyRentTabComponent);

const styles = StyleSheet.create({
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl + 56,
    gap: Spacing.sm,
  },
});
