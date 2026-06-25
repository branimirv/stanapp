import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { PropertyForm } from '@/components/property/PropertyForm';
import { useThemedScreenStyles } from '@/hooks/useThemedScreenStyles';
import { useProperties } from '@/hooks/useProperties';
import { supabase } from '@/lib/supabase';
import { useUiStore } from '@/stores/uiStore';
import type { Property, UsageStatus } from '@/types/app.types';
import type { PropertyFormValues } from '@/utils/validators';

export default function EditPropertyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { properties, update } = useProperties();
  const showToast = useUiStore((s) => s.showToast);

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const screenStyles = useThemedScreenStyles();

  const loadProperty = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (err) {
      setError(err.message);
      setProperty(null);
    } else {
      setProperty(data);
    }

    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

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
        message: err instanceof Error ? err.message : t('properties.saveFailed'),
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: t('properties.editProperty') }} />
        <SkeletonLoader count={6} style={styles.loader} />
      </>
    );
  }

  if (error || !property) {
    return (
      <>
        <Stack.Screen options={{ title: t('properties.editProperty') }} />
        <ErrorState message={error ?? t('properties.notFound')} onRetry={loadProperty} />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('properties.editProperty') }} />
      <View style={[screenStyles.container, styles.container]}>
        <PropertyForm
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
