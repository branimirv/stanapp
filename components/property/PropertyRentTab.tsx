import { memo, useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MonthlyGrid } from '@/components/rent/MonthlyGrid';
import { RentPaymentCard } from '@/components/rent/RentPaymentCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Text } from '@/components/ui/text';
import { PROPERTY_SCENE_TOP_GAP } from '@/components/property/PropertyTabBar';
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
  /** Clears floating header + tabs; content still peeks under glass. */
  contentTopInset?: number;
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
  contentTopInset = 0,
}: PropertyRentTabProps) {
  const { t } = useTranslation();
  const listTopPad = (contentTopInset || 0) + PROPERTY_SCENE_TOP_GAP;

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

  if (isLoading) {
    return <SkeletonLoader count={3} style={[styles.content, { paddingTop: listTopPad }]} />;
  }

  return (
    <FlatList
      data={rentPayments}
      keyExtractor={keyExtractor}
      renderItem={renderPayment}
      contentContainerStyle={[styles.content, { paddingTop: listTopPad }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      {...listPerformanceProps}
      ListHeaderComponent={
        <View className="mb-4 gap-3">
          <View className="bg-card/90 border-border overflow-hidden rounded-3xl border shadow-sm shadow-black/5">
            <MonthlyGrid
              payments={rentPayments}
              year={year}
              language={language}
              onMonthPress={onMonthPress}
            />
          </View>
          {rentPayments.length > 0 ? (
            <Text className="text-foreground mt-1 text-base font-bold">{t('rent.title')}</Text>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        <View className="bg-muted/50 rounded-3xl px-2 py-4">
          <EmptyState
            title={t('empty.noRentPayments')}
            subtitle={t('empty.noRentPaymentsHint')}
            ctaLabel={canManage ? t('rent.addPayment') : undefined}
            onCtaPress={canManage ? onAddPayment : undefined}
          />
        </View>
      }
    />
  );
}

export const PropertyRentTab = memo(PropertyRentTabComponent);

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl + 56,
  },
});
