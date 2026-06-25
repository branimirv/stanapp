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
import type { Tenant } from '@/types/app.types';
import type { TenantFormValues } from '@/utils/validators';

export default function EditTenantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { update } = useTenants();
  const showToast = useUiStore((s) => s.showToast);

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const screenStyles = useThemedScreenStyles();

  const loadTenant = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    const { data, error: err } = await supabase.from('tenants').select('*').eq('id', id).single();

    if (err) {
      setError(err.message);
      setTenant(null);
    } else {
      setTenant(data);
    }

    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    loadTenant();
  }, [loadTenant]);

  const handleSubmit = async (values: TenantFormValues) => {
    if (!id) return;

    setIsSaving(true);
    try {
      await update(id, {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email || null,
        phone: values.phone ?? null,
        contract_start: values.contract_start,
        contract_end: values.contract_end ?? null,
        deposit_amount: values.deposit_amount,
        notes: values.notes ?? null,
      });

      showToast({ message: t('tenants.saveSuccess'), type: 'success' });
      router.back();
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
        <Stack.Screen options={{ title: t('tenants.editTenant') }} />
        <SkeletonLoader count={6} style={styles.loader} />
      </>
    );
  }

  if (error || !tenant) {
    return (
      <>
        <Stack.Screen options={{ title: t('tenants.editTenant') }} />
        <ErrorState message={error ?? t('tenants.notFound')} onRetry={loadTenant} />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('tenants.editTenant') }} />
      <View style={[screenStyles.container, styles.container]}>
        <TenantForm
          defaultValues={{
            first_name: tenant.first_name,
            last_name: tenant.last_name,
            email: tenant.email ?? '',
            phone: tenant.phone,
            contract_start: tenant.contract_start,
            contract_end: tenant.contract_end,
            deposit_amount: tenant.deposit_amount,
            notes: tenant.notes,
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSaving}
          submitLabel={t('common.update')}
        />
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
