import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { RentPaymentCard } from '@/components/rent/RentPaymentCard';
import { Spacing, Typography } from '@/constants/theme';
import { CONTRACT_EXPIRING_DAYS } from '@/constants/config';
import { useProfile } from '@/hooks/useProfile';
import { useRentPayments } from '@/hooks/useRentPayments';
import { useTenants } from '@/hooks/useTenants';
import { supabase } from '@/lib/supabase';
import { useUiStore } from '@/stores/uiStore';
import type { Property, Tenant } from '@/types/app.types';
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
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const showToast = useUiStore((s) => s.showToast);
  const showConfirmDialog = useUiStore((s) => s.showConfirmDialog);

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { profile } = useProfile();
  const language = profile?.language ?? (i18n.language as 'en' | 'hr');
  const currency = resolveCurrency(profile, property);

  const { update, remove } = useTenants();
  const { rentPayments, isLoading: paymentsLoading } = useRentPayments({
    tenantId: id,
  });

  const loadTenant = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    const { data, error: err } = await supabase.from('tenants').select('*').eq('id', id).single();

    if (err) {
      setError(err.message);
      setTenant(null);
      setIsLoading(false);
      return;
    }

    setTenant(data);

    const { data: propertyData } = await supabase
      .from('properties')
      .select('*')
      .eq('id', data.property_id)
      .single();

    setProperty(propertyData ?? null);
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    loadTenant();
  }, [loadTenant]);

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

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: t('tenants.tenantDetails') }} />
        <SkeletonLoader count={5} style={styles.loader} />
      </>
    );
  }

  if (error || !tenant) {
    return (
      <>
        <Stack.Screen options={{ title: t('tenants.tenantDetails') }} />
        <ErrorState message={error ?? t('tenants.notFound')} onRetry={loadTenant} />
      </>
    );
  }

  const badge = getContractBadge(tenant, t);
  const fullName = `${tenant.first_name} ${tenant.last_name}`;

  return (
    <>
      <Stack.Screen
        options={{
          title: fullName,
          headerRight: () => (
            <AppButton mode="text" onPress={() => router.push(`/tenant/edit/${tenant.id}`)}>
              {t('common.edit')}
            </AppButton>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: theme.colors.onSurface }]}>{fullName}</Text>
          <AppBadge label={badge.label} variant={badge.variant} />
        </View>

        {property ? (
          <Text
            style={[styles.propertyLink, { color: theme.colors.primary }]}
            onPress={() => router.push(`/property/${property.id}`)}
          >
            {property.name}
          </Text>
        ) : null}

        <Divider style={styles.divider} />

        <Text style={[styles.section, { color: theme.colors.onSurface }]}>
          {t('tenants.contactInfo')}
        </Text>
        {tenant.email ? (
          <Text style={[styles.row, { color: theme.colors.onSurfaceVariant }]}>
            {t('tenants.email')}: {tenant.email}
          </Text>
        ) : null}
        {tenant.phone ? (
          <Text style={[styles.row, { color: theme.colors.onSurfaceVariant }]}>
            {t('tenants.phone')}: {tenant.phone}
          </Text>
        ) : null}

        <Text style={[styles.section, { color: theme.colors.onSurface }]}>
          {t('tenants.contractPeriod')}
        </Text>
        <Text style={[styles.row, { color: theme.colors.onSurfaceVariant }]}>
          {formatDate(tenant.contract_start, language)}
          {' — '}
          {tenant.contract_end
            ? formatDate(tenant.contract_end, language)
            : t('tenants.noContractEnd')}
        </Text>

        <Text style={[styles.row, { color: theme.colors.onSurfaceVariant }]}>
          {t('tenants.deposit')}: {formatCurrency(tenant.deposit_amount, currency, language)}
        </Text>

        {tenant.notes ? (
          <>
            <Text style={[styles.section, { color: theme.colors.onSurface }]}>
              {t('common.notes')}
            </Text>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>{tenant.notes}</Text>
          </>
        ) : null}

        <Text style={[styles.section, { color: theme.colors.onSurface }]}>
          {t('tenants.rentPayments')}
        </Text>

        {paymentsLoading ? (
          <SkeletonLoader count={2} />
        ) : rentPayments.length === 0 ? (
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
        ) : (
          rentPayments.map((payment) => (
            <RentPaymentCard
              key={payment.id}
              payment={payment}
              propertyName={property?.name}
              currency={currency}
              language={language}
            />
          ))
        )}

        <View style={styles.actions}>
          {tenant.is_active ? (
            <AppButton mode="outlined" onPress={handleDeactivate}>
              {t('tenants.deactivate')}
            </AppButton>
          ) : null}
          <AppButton mode="outlined" textColor={theme.colors.error} onPress={handleDelete}>
            {t('common.delete')}
          </AppButton>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  loader: {
    padding: Spacing.md,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  name: {
    ...Typography.headlineMedium,
    flex: 1,
  },
  propertyLink: {
    ...Typography.bodyMedium,
  },
  divider: {
    marginVertical: Spacing.sm,
  },
  section: {
    ...Typography.titleMedium,
    marginTop: Spacing.sm,
  },
  row: {
    ...Typography.bodyMedium,
  },
  actions: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
});
