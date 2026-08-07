import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Linking } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocale } from '@/hooks/useLocale';
import { useProfile } from '@/hooks/useProfile';
import { useProperty } from '@/hooks/useProperties';
import { useRentPayments } from '@/hooks/useRentPayments';
import { useTenant, useTenantMutations } from '@/hooks/useTenants';
import { routes } from '@/lib/routes';
import { useUiStore } from '@/stores/uiStore';
import type { Language } from '@/types/app.types';
import { resolveCurrency } from '@/utils/currency';

function openUrl(url: string) {
  Linking.openURL(url).catch(() => undefined);
}

/** Data, sorted payments, and danger-zone handlers for tenant detail. */
export function useTenantDetailScreen() {
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

  const sortedPayments = useMemo(() => {
    return [...rentPayments].sort((a, b) => {
      if (a.period_year !== b.period_year) return b.period_year - a.period_year;
      return b.period_month - a.period_month;
    });
  }, [rentPayments]);

  const fullName = tenant ? `${tenant.first_name} ${tenant.last_name}` : '';

  const handleDeactivate = useCallback(() => {
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
  }, [loadTenant, showConfirmDialog, showToast, t, tenant, update]);

  const handleDelete = useCallback(() => {
    if (!tenant) return;

    showConfirmDialog({
      title: t('confirm.deleteTenantTitle'),
      message: t('confirm.deleteTenantMessage'),
      confirmLabel: t('common.remove'),
      destructive: true,
      icon: 'userMinus',
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
  }, [remove, showConfirmDialog, showToast, t, tenant]);

  const handleEdit = useCallback(() => {
    if (!tenant) return;
    router.push(routes.tenant.edit(tenant.id));
  }, [tenant]);

  const handlePropertyPress = useCallback(() => {
    if (!property) return;
    router.push(routes.property.detail(property.id));
  }, [property]);

  const handleCall = useCallback(() => {
    if (!tenant?.phone) return;
    openUrl(`tel:${tenant.phone}`);
  }, [tenant?.phone]);

  const handleMessage = useCallback(() => {
    if (!tenant?.phone) return;
    openUrl(`sms:${tenant.phone}`);
  }, [tenant?.phone]);

  const handleEmail = useCallback(() => {
    if (!tenant?.email) return;
    openUrl(`mailto:${tenant.email}`);
  }, [tenant?.email]);

  const handleAddPayment = useCallback(() => {
    if (!tenant) return;
    router.push({
      pathname: routes.rent.new,
      params: { propertyId: tenant.property_id, tenantId: tenant.id },
    });
  }, [tenant]);

  return {
    t,
    tenant,
    property,
    isLoading,
    error,
    loadTenant,
    currency,
    language: language as Language,
    sortedPayments,
    paymentsLoading,
    fullName,
    handleDeactivate,
    handleDelete,
    handleEdit,
    handlePropertyPress,
    handleCall,
    handleMessage,
    handleEmail,
    handleAddPayment,
  };
}
