import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type TenantDetailFooterProps = {
  isActive: boolean;
  onDeactivate: () => void;
  onDelete: () => void;
};

/** Danger-zone actions at the bottom of the tenant detail list. */
export function TenantDetailFooter({
  isActive,
  onDeactivate,
  onDelete,
}: TenantDetailFooterProps) {
  const { t } = useTranslation();

  return (
    <View className="mt-2 gap-2.5">
      {isActive ? (
        <Pressable
          onPress={onDeactivate}
          className="bg-surface-2 min-h-12 flex-row items-center justify-center gap-1.5 rounded-full px-4.5"
          accessibilityRole="button"
          accessibilityLabel={t('tenants.deactivate')}
        >
          <Text className="text-fg text-sm font-semibold">{t('tenants.deactivate')}</Text>
        </Pressable>
      ) : null}

      <Pressable
        onPress={onDelete}
        className="bg-surface-2 min-h-12 flex-row items-center justify-center gap-1.5 rounded-full px-4.5"
        accessibilityRole="button"
        accessibilityLabel={t('tenants.removeTenant')}
      >
        <Text className="text-neg text-sm font-semibold">{t('tenants.removeTenant')}</Text>
      </Pressable>
    </View>
  );
}
