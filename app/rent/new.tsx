import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { StackScreenChrome } from '@/components/ui/StackScreenChrome';
import { RentPaymentForm } from '@/components/rent/RentPaymentForm';
import { useThemedScreenStyles } from '@/hooks/useThemedScreenStyles';
import { useProperties } from '@/hooks/useProperties';
import { useRentPaymentMutations } from '@/hooks/useRentPayments';
import { useTenants } from '@/hooks/useTenants';
import { useUiStore } from '@/stores/uiStore';
import type { RentPaymentFormValues } from '@/utils/validators';

export default function NewRentPaymentScreen() {
  const { propertyId, tenantId, periodMonth, periodYear } = useLocalSearchParams<{
    propertyId?: string;
    tenantId?: string;
    periodMonth?: string;
    periodYear?: string;
  }>();
  const { t } = useTranslation();
  const { properties, isLoading: propertiesLoading } = useProperties();
  const { tenants, isLoading: tenantsLoading } = useTenants();
  const { create } = useRentPaymentMutations();
  const showToast = useUiStore((s) => s.showToast);
  const [isSaving, setIsSaving] = useState(false);
  const screenStyles = useThemedScreenStyles();

  const handleSubmit = async (values: RentPaymentFormValues) => {
    setIsSaving(true);
    try {
      const payment = await create({
        property_id: values.property_id,
        tenant_id: values.tenant_id,
        amount: values.amount,
        period_month: values.period_month,
        period_year: values.period_year,
        status: values.status,
        payment_date: values.payment_date ?? null,
        notes: values.notes ?? null,
      });

      showToast({ message: t('rent.saveSuccess'), type: 'success' });
      router.replace(`/rent/${payment.id}`);
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : t('rent.saveFailed'),
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (propertiesLoading || tenantsLoading) {
    return (
      <StackScreenChrome title={t('rent.newPayment')}>
        <SkeletonLoader count={6} style={styles.loader} />
      </StackScreenChrome>
    );
  }

  return (
    <StackScreenChrome title={t('rent.newPayment')} edgeToEdge>
      <View style={screenStyles.container}>
        <RentPaymentForm
          properties={properties}
          tenants={tenants}
          defaultValues={{
            ...(propertyId ? { property_id: propertyId } : {}),
            ...(tenantId ? { tenant_id: tenantId } : {}),
            ...(periodMonth ? { period_month: Number(periodMonth) } : {}),
            ...(periodYear ? { period_year: Number(periodYear) } : {}),
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSaving}
          submitLabel={t('common.create')}
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
