import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PropertyForm } from '@/components/property/PropertyForm';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { StackScreenChrome } from '@/components/ui/StackScreenChrome';
import { useProperties, useProperty } from '@/hooks/useProperties';
import { useUiStore } from '@/stores/uiStore';
import type { UsageStatus } from '@/types/app.types';
import { getErrorMessage } from '@/utils/errors';
import type { PropertyFormValues } from '@/utils/validators';

export default function EditPropertyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { properties, update } = useProperties();
  const { property, isLoading, error, refetch: loadProperty } = useProperty(id);
  const showToast = useUiStore((s) => s.showToast);

  const [isSaving, setIsSaving] = useState(false);

  const handleUsageStatusChange = (_from: UsageStatus, _to: UsageStatus) =>
    new Promise<boolean>((resolve) => {
      Alert.alert(t('confirm.changeUsageTitle'), t('confirm.changeUsageMessage'), [
        { text: t('common.cancel'), style: 'cancel', onPress: () => resolve(false) },
        { text: t('common.continue'), onPress: () => resolve(true) },
      ]);
    });

  const handleSubmit = async (values: PropertyFormValues) => {
    if (!id) return;

    setIsSaving(true);
    try {
      await update(id, {
        type: values.type,
        usage_status: values.usage_status,
        parent_property_id: values.parent_property_id ?? null,
        name: values.name,
        address: values.address,
        floor: values.floor ?? null,
        area_sqm: values.area_sqm ?? null,
        rent_amount: values.rent_amount,
        notes: values.notes ?? null,
      });

      showToast({ message: t('properties.saveSuccess'), type: 'success' });
      router.back();
    } catch (err) {
      showToast({
        message: getErrorMessage(err, t('properties.saveFailed')),
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const pageTitle = property
    ? t('properties.editNamed', { name: property.name })
    : t('properties.editProperty');

  if (isLoading) {
    return (
      <StackScreenChrome title={pageTitle} hideHeaderTitle edgeToEdge>
        <SkeletonLoader count={6} style={styles.loader} />
      </StackScreenChrome>
    );
  }

  if (error || !property) {
    return (
      <StackScreenChrome title={pageTitle} hideHeaderTitle edgeToEdge>
        <ErrorState message={error ?? t('properties.notFound')} onRetry={loadProperty} />
      </StackScreenChrome>
    );
  }

  return (
    <StackScreenChrome title={pageTitle} hideHeaderTitle edgeToEdge>
      <View className="flex-1 bg-transparent">
        <PropertyForm
          title={pageTitle}
          defaultValues={{
            type: property.type,
            usage_status: property.usage_status,
            parent_property_id: property.parent_property_id,
            name: property.name,
            address: property.address,
            floor: property.floor,
            area_sqm: property.area_sqm,
            rent_amount: property.rent_amount,
            notes: property.notes,
          }}
          parentProperties={properties.filter((p) => p.id !== property.id)}
          onSubmit={handleSubmit}
          onUsageStatusChange={handleUsageStatusChange}
          isSubmitting={isSaving}
          submitLabel={t('properties.saveChangesCta')}
        />
      </View>
    </StackScreenChrome>
  );
}

const styles = StyleSheet.create({
  loader: {
    padding: 16,
    marginTop: 80,
  },
});
