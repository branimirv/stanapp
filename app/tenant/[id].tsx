import { ArrowDownToLine, Pencil, Plus } from 'lucide-react-native';
import { useCallback } from 'react';
import { FlatList } from 'react-native';

import { RentPaymentCard } from '@/components/rent/RentPaymentCard';
import { TenantDetailFooter } from '@/components/tenant/TenantDetailFooter';
import { TenantDetailHeader } from '@/components/tenant/TenantDetailHeader';
import { DetailScreenScaffold } from '@/components/ui/DetailScreenScaffold';
import { EmptyState } from '@/components/ui/EmptyState';
import { HeaderIconButton } from '@/components/ui/HeaderIconButton';
import { StackHeaderActions } from '@/components/ui/StackHeaderActions';
import { listPerformanceProps } from '@/constants/list';
import { useTenantDetailScreen } from '@/hooks/useTenantDetailScreen';
import type { RentPayment } from '@/types/app.types';

export default function TenantDetailScreen() {
  const screen = useTenantDetailScreen();

  const keyExtractor = useCallback((payment: RentPayment) => payment.id, []);

  const renderItem = useCallback(
    ({ item }: { item: RentPayment }) => (
      <RentPaymentCard
        payment={item}
        currency={screen.currency}
        language={screen.language}
      />
    ),
    [screen.currency, screen.language],
  );

  if (screen.isLoading || screen.error || !screen.tenant) {
    return (
      <DetailScreenScaffold
        title={screen.t('tenants.tenantDetails')}
        isLoading={screen.isLoading}
        isReady={Boolean(screen.tenant)}
        error={screen.error}
        notFoundMessage={screen.t('tenants.notFound')}
        onRetry={screen.loadTenant}
      >
        {null}
      </DetailScreenScaffold>
    );
  }

  const tenant = screen.tenant;

  return (
    <DetailScreenScaffold
      title={screen.fullName}
      hideHeaderTitle
      isLoading={false}
      isReady
      error={null}
      notFoundMessage={screen.t('tenants.notFound')}
      onRetry={screen.loadTenant}
      headerRight={() => (
        <StackHeaderActions>
          <HeaderIconButton
            icon={Pencil}
            onPress={screen.handleEdit}
            accessibilityLabel={screen.t('common.edit')}
          />
        </StackHeaderActions>
      )}
    >
      <FlatList
        data={screen.paymentsLoading ? [] : screen.sortedPayments}
        keyExtractor={keyExtractor}
        {...listPerformanceProps}
        renderItem={renderItem}
        ListHeaderComponent={
          <TenantDetailHeader
            tenant={tenant}
            property={screen.property}
            currency={screen.currency}
            language={screen.language}
            paymentsLoading={screen.paymentsLoading}
            onPropertyPress={screen.handlePropertyPress}
            onCall={screen.handleCall}
            onMessage={screen.handleMessage}
            onEmail={screen.handleEmail}
          />
        }
        ListEmptyComponent={
          screen.paymentsLoading ? null : (
            <EmptyState
              icon={ArrowDownToLine}
              title={screen.t('empty.noRentPayments')}
              subtitle={screen.t('empty.noRentPaymentsHint')}
              ctaLabel={screen.t('rent.addPayment')}
              ctaIcon={Plus}
              onCtaPress={screen.handleAddPayment}
              className="mb-4"
            />
          )
        }
        ListFooterComponent={
          <TenantDetailFooter
            isActive={tenant.is_active}
            onDeactivate={screen.handleDeactivate}
            onDelete={screen.handleDelete}
          />
        }
        contentContainerClassName="px-gutter pb-12"
      />
    </DetailScreenScaffold>
  );
}
