import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, Linking, Pressable, StyleSheet, View } from 'react-native';
import { Mail, MessageSquare, Pencil, Phone } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { DetailScreenScaffold } from '@/components/ui/DetailScreenScaffold';
import { HeaderIconButton } from '@/components/ui/HeaderIconButton';
import { StackHeaderActions } from '@/components/ui/StackHeaderActions';
import { EmptyState } from '@/components/ui/EmptyState';
import { Separator } from '@/components/ui/separator';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Text } from '@/components/ui/text';
import { RentPaymentCard } from '@/components/rent/RentPaymentCard';
import { listPerformanceProps } from '@/constants/list';
import { Spacing } from '@/constants/theme';
import { CONTRACT_EXPIRING_DAYS } from '@/constants/config';
import { useLocale } from '@/hooks/useLocale';
import { useProfile } from '@/hooks/useProfile';
import { useProperty } from '@/hooks/useProperties';
import { useRentPayments } from '@/hooks/useRentPayments';
import { useTenant, useTenantMutations } from '@/hooks/useTenants';
import { useUiStore } from '@/stores/uiStore';
import type { Tenant } from '@/types/app.types';
import { resolveCurrency } from '@/utils/currency';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { differenceInDays, parseISO } from 'date-fns';

function getContractBadge(tenant: Tenant, t: (key: string, opts?: Record<string, unknown>) => string) {
  if (!tenant.is_active) return { label: t('tenants.expired'), variant: 'error' as const };
  if (!tenant.contract_end) return { label: t('tenants.active'), variant: 'success' as const };

  const daysLeft = differenceInDays(parseISO(tenant.contract_end), new Date());
  if (daysLeft < 0) return { label: t('tenants.expired'), variant: 'error' as const };
  if (daysLeft <= CONTRACT_EXPIRING_DAYS) {
    return { label: t('tenants.expiringSoon'), variant: 'warning' as const };
  }
  return { label: t('tenants.active'), variant: 'success' as const };
}

export default function TenantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const showToast = useUiStore((s) => s.showToast);
  const showConfirmDialog = useUiStore((s) => s.showConfirmDialog);

  const { tenant, isLoading, error, refetch: loadTenant } = useTenant(id);
  const { property } = useProperty(tenant?.property_id ?? undefined);

  const { profile } = useProfile();
  const { language } = useLocale();
  const currency = resolveCurrency(profile, property);

  const { update, remove } = useTenantMutations();
  const { rentPayments, isLoading: paymentsLoading } = useRentPayments({
    tenantId: id,
  });

  const handleDeactivate = () => {
    if (!tenant) return;

    showConfirmDialog({
      title: t('confirm.deactivateTenantTitle'),
      message: t('confirm.deactivateTenantMessage'),
      confirmLabel: t('tenants.deactivate'),
      destructive: true,
      onConfirm: async () => {
        try {
          await update(tenant.id, { is_active: false });
          showToast({ message: t('tenants.saveSuccess'), type: 'success' });
          await loadTenant();
        } catch (err) {
          showToast({
            message: err instanceof Error ? err.message : t('tenants.saveFailed'),
            type: 'error',
          });
        }
      },
    });
  };

  const handleDelete = () => {
    if (!tenant) return;

    showConfirmDialog({
      title: t('confirm.deleteTenantTitle'),
      message: t('confirm.deleteTenantMessage'),
      confirmLabel: t('common.delete'),
      destructive: true,
      onConfirm: async () => {
        try {
          await remove(tenant.id);
          showToast({ message: t('tenants.deleteSuccess'), type: 'success' });
          router.back();
        } catch (err) {
          showToast({
            message: err instanceof Error ? err.message : t('tenants.deleteFailed'),
            type: 'error',
          });
        }
      },
    });
  };

  if (isLoading || error || !tenant) {
    return (
      <DetailScreenScaffold
        title={t('tenants.tenantDetails')}
        isLoading={isLoading}
        isReady={Boolean(tenant)}
        error={error}
        notFoundMessage={t('tenants.notFound')}
        onRetry={loadTenant}
      >
        {null}
      </DetailScreenScaffold>
    );
  }

  const badge = getContractBadge(tenant, t);
  const fullName = `${tenant.first_name} ${tenant.last_name}`;

  return (
    <DetailScreenScaffold
      title={fullName}
      isLoading={false}
      isReady
      error={null}
      notFoundMessage={t('tenants.notFound')}
      onRetry={loadTenant}
      headerRight={() => (
        <StackHeaderActions>
          <HeaderIconButton
            icon={Pencil}
            onPress={() => router.push(`/tenant/edit/${tenant.id}`)}
            accessibilityLabel={t('common.edit')}
          />
        </StackHeaderActions>
      )}
    >
      <FlatList
        data={paymentsLoading ? [] : rentPayments}
        keyExtractor={(payment) => payment.id}
        {...listPerformanceProps}
        renderItem={({ item: payment }) => (
          <RentPaymentCard
            payment={payment}
            propertyName={property?.name}
            currency={currency}
            language={language}
          />
        )}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <View style={styles.header}>
              <Text className="flex-1 text-2xl font-semibold">{fullName}</Text>
              <AppBadge label={badge.label} variant={badge.variant} />
            </View>

            {property ? (
              <Text
                className="text-primary text-base"
                onPress={() => router.push(`/property/${property.id}`)}
              >
                {property.name}
              </Text>
            ) : null}

            <Separator style={styles.divider} />

            <Text className="text-foreground mt-2 text-lg font-medium">
              {t('tenants.contactInfo')}
            </Text>
            {tenant.email ? (
              <Pressable
                style={styles.contactRow}
                onPress={() => Linking.openURL(`mailto:${tenant.email}`)}
                accessibilityRole="button"
                accessibilityLabel={t('tenants.emailTenant')}
              >
                <Mail size={16} className="text-primary" strokeWidth={2} />
                <Text className="text-primary text-base">{tenant.email}</Text>
              </Pressable>
            ) : null}

            {tenant.phone ? (
              <>
                <Pressable
                  style={styles.contactRow}
                  onPress={() => Linking.openURL(`tel:${tenant.phone}`)}
                  accessibilityRole="button"
                  accessibilityLabel={t('tenants.callTenant')}
                >
                  <Phone size={16} className="text-primary" strokeWidth={2} />
                  <Text className="text-primary text-base">{tenant.phone}</Text>
                </Pressable>
                <Pressable
                  style={styles.contactRow}
                  onPress={() => Linking.openURL(`sms:${tenant.phone}`)}
                  accessibilityRole="button"
                  accessibilityLabel={t('tenants.messageTenant')}
                >
                  <MessageSquare size={16} className="text-primary" strokeWidth={2} />
                  <Text className="text-primary text-base">{t('tenants.sendMessage')}</Text>
                </Pressable>
              </>
            ) : null}

            <Text className="text-foreground mt-2 text-lg font-medium">
              {t('tenants.contractPeriod')}
            </Text>
            <Text className="text-muted-foreground text-base">
              {formatDate(tenant.contract_start, language)}
              {' — '}
              {tenant.contract_end
                ? formatDate(tenant.contract_end, language)
                : t('tenants.noContractEnd')}
            </Text>

            <Text className="text-muted-foreground text-base">
              {t('tenants.deposit')}: {formatCurrency(tenant.deposit_amount, currency, language)}
            </Text>

            {tenant.notes ? (
              <>
                <Text className="text-foreground mt-2 text-lg font-medium">
                  {t('common.notes')}
                </Text>
                <Text className="text-muted-foreground">{tenant.notes}</Text>
              </>
            ) : null}

            <Text className="text-foreground mt-2 text-lg font-medium">
              {t('tenants.rentPayments')}
            </Text>

            {paymentsLoading ? <SkeletonLoader count={2} /> : null}
          </View>
        }
        ListEmptyComponent={
          paymentsLoading ? null : (
            <EmptyState
              title={t('tenants.noRentPayments')}
              ctaLabel={t('rent.addPayment')}
              onCtaPress={() =>
                router.push({
                  pathname: '/rent/new',
                  params: { propertyId: tenant.property_id, tenantId: tenant.id },
                })
              }
            />
          )
        }
        ListFooterComponent={
          <View style={styles.actions}>
            {tenant.is_active ? (
              <AppButton mode="outlined" onPress={handleDeactivate}>
                {t('tenants.deactivate')}
              </AppButton>
            ) : null}
            <AppButton mode="outlined" textColor="destructive" onPress={handleDelete}>
              {t('common.delete')}
            </AppButton>
          </View>
        }
        contentContainerStyle={styles.content}
      />
    </DetailScreenScaffold>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  headerContent: {
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  divider: {
    marginVertical: Spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  actions: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
});
