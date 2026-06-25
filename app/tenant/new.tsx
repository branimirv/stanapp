import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { TenantForm } from '@/components/tenant/TenantForm';
import { useThemedScreenStyles } from '@/hooks/useThemedScreenStyles';
import { useTenants } from '@/hooks/useTenants';
import { supabase } from '@/lib/supabase';
import { useUiStore } from '@/stores/uiStore';
import type { Property } from '@/types/app.types';
import type { TenantFormValues } from '@/utils/validators';

export default function NewTenantScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const { t } = useTranslation();
  const { create } = useTenants();
  const showToast = useUiStore((s) => s.showToast);

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const screenStyles = useThemedScreenStyles();

  const loadProperty = useCallback(async () => {
    if (!propertyId) {
      setError(t('validation.selectProperty'));
      setIsLoading(false);
      return;
    }

    const { data, error: err } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (err) {
      setError(err.message);
    } else if (data.usage_status !== 'rented') {
      setError(t('tenants.onlyForRented'));
    } else {
      setProperty(data);
    }

    setIsLoading(false);
  }, [propertyId, t]);

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

  const handleSubmit = async (values: TenantFormValues) => {
    if (!propertyId) return;

    setIsSaving(true);
    try {
      const tenant = await create({
        property_id: propertyId,
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email || null,
        phone: values.phone ?? null,
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
      <>
        <Stack.Screen options={{ title: t('tenants.newTenant') }} />
        <SkeletonLoader count={6} style={styles.loader} />
      </>
    );
  }

  if (error || !property) {
    return (
      <>
        <Stack.Screen options={{ title: t('tenants.newTenant') }} />
        <ErrorState message={error ?? t('properties.notFound')} onRetry={loadProperty} />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('tenants.newTenant') }} />
      <View style={[screenStyles.container, styles.container]}>
        <TenantForm onSubmit={handleSubmit} isSubmitting={isSaving} submitLabel={t('common.create')} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  loader: {
    padding: 16,
  },
});
