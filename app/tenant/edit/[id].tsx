import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { StackScreenChrome } from '@/components/ui/StackScreenChrome';
import { TenantForm } from '@/components/tenant/TenantForm';
import { useThemedScreenStyles } from '@/hooks/useThemedScreenStyles';
import { useTenant, useTenantMutations } from '@/hooks/useTenants';
import { useUiStore } from '@/stores/uiStore';
import type { TenantFormValues } from '@/utils/validators';

export default function EditTenantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { update } = useTenantMutations();
  const { tenant, isLoading, error, refetch: loadTenant } = useTenant(id);
  const showToast = useUiStore((s) => s.showToast);

  const [isSaving, setIsSaving] = useState(false);
  const screenStyles = useThemedScreenStyles();

  const handleSubmit = async (values: TenantFormValues) => {
    if (!id) return;

    setIsSaving(true);
    try {
      await update(id, {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email || null,
        phone: values.phone,
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
      <StackScreenChrome title={t('tenants.editTenant')}>
        <SkeletonLoader count={6} style={styles.loader} />
      </StackScreenChrome>
    );
  }

  if (error || !tenant) {
    return (
      <StackScreenChrome title={t('tenants.editTenant')}>
        <ErrorState message={error ?? t('tenants.notFound')} onRetry={loadTenant} />
      </StackScreenChrome>
    );
  }

  return (
    <StackScreenChrome title={t('tenants.editTenant')} edgeToEdge>
      <View style={screenStyles.container}>
        <TenantForm
          defaultValues={{
            first_name: tenant.first_name,
            last_name: tenant.last_name,
            email: tenant.email ?? '',
            phone: tenant.phone ?? '',
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
    </StackScreenChrome>
  );
}

const styles = StyleSheet.create({
  loader: {
    padding: 16,
  },
});
