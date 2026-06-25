import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PropertyForm } from '@/components/property/PropertyForm';
import { useThemedScreenStyles } from '@/hooks/useThemedScreenStyles';
import { useProperties } from '@/hooks/useProperties';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import type { UsageStatus } from '@/types/app.types';
import type { PropertyFormValues } from '@/utils/validators';

export default function NewPropertyScreen() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { properties, create } = useProperties();
  const showToast = useUiStore((s) => s.showToast);
  const [isSaving, setIsSaving] = useState(false);
  const screenStyles = useThemedScreenStyles();

  const handleUsageStatusChange = (_from: UsageStatus, _to: UsageStatus) =>
    new Promise<boolean>((resolve) => {
      Alert.alert(t('confirm.changeUsageTitle'), t('confirm.changeUsageMessage'), [
        { text: t('common.cancel'), style: 'cancel', onPress: () => resolve(false) },
        { text: t('common.continue'), onPress: () => resolve(true) },
      ]);
    });

  const handleSubmit = async (values: PropertyFormValues) => {
    if (!user) return;

    setIsSaving(true);
    try {
      const property = await create({
        user_id: user.id,
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
      router.replace(`/property/${property.id}`);
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : t('properties.saveFailed'),
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: t('properties.newProperty') }} />
      <View style={[screenStyles.container, styles.container]}>
        <PropertyForm
          parentProperties={properties}
          onSubmit={handleSubmit}
          onUsageStatusChange={handleUsageStatusChange}
          isSubmitting={isSaving}
          submitLabel={t('common.create')}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
});
