import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { StackScreenChrome } from '@/components/ui/StackScreenChrome';
import { TenantForm } from '@/components/tenant/TenantForm';
import { useThemedScreenStyles } from '@/hooks/useThemedScreenStyles';
import { useProperty } from '@/hooks/useProperties';
import { useTenantMutations } from '@/hooks/useTenants';
import { useUiStore } from '@/stores/uiStore';
import type { TenantFormValues } from '@/utils/validators';

export default function NewTenantScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const { t } = useTranslation();
  const { create } = useTenantMutations();
  const showToast = useUiStore((s) => s.showToast);

  const {
    property,
    isLoading,
    error: loadError,
    refetch: loadProperty,
  } = useProperty(propertyId);
  const [isSaving, setIsSaving] = useState(false);
  const screenStyles = useThemedScreenStyles();

  const error = !propertyId
    ? t('validation.selectProperty')
    : loadError ?? (property && property.usage_status !== 'rented' ? t('tenants.onlyForRented') : null);
  const canAddTenant = Boolean(property && property.usage_status === 'rented');

  const handleSubmit = async (values: TenantFormValues) => {
    if (!propertyId) return;

    setIsSaving(true);
    try {
      const tenant = await create({
        property_id: propertyId,
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email || null,
        phone: values.phone,
        contract_start: values.contract_start,
        contract_end: values.contract_end ?? null,
        deposit_amount: values.deposit_amount,
        notes: values.notes ?? null,
        is_active: true,
      });

      showToast({ message: t('tenants.saveSuccess'), type: 'success' });
      router.replace(`/tenant/${tenant.id}`);
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : t('tenants.saveFailed'),
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <StackScreenChrome title={t('tenants.newTenant')}>
        <SkeletonLoader count={6} style={styles.loader} />
      </StackScreenChrome>
    );
  }

  if (error || !canAddTenant) {
    return (
      <StackScreenChrome title={t('tenants.newTenant')}>
        <ErrorState message={error ?? t('properties.notFound')} onRetry={loadProperty} />
      </StackScreenChrome>
    );
  }

  return (
    <StackScreenChrome title={t('tenants.newTenant')} edgeToEdge>
      <View style={screenStyles.container}>
        <TenantForm onSubmit={handleSubmit} isSubmitting={isSaving} submitLabel={t('common.create')} />
      </View>
    </StackScreenChrome>
  );
}

const styles = StyleSheet.create({
  loader: {
    padding: 16,
  },
});
