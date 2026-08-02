import { useCallback, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/ui/AppButton';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { StackScreenChrome } from '@/components/ui/StackScreenChrome';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { requestNotificationPermissions } from '@/lib/notifications';
import { useUiStore } from '@/stores/uiStore';
import {
  loadNotificationPreferences,
  saveNotificationPreferences,
  type NotificationPreferences,
} from '@/utils/notificationPreferences';

export default function NotificationSettingsScreen() {
  const { t } = useTranslation();
  const showToast = useUiStore((s) => s.showToast);

  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadNotificationPreferences().then((prefs) => {
      setPreferences(prefs);
      setIsLoading(false);
    });
  }, []);

  const updatePreference = useCallback(
    (key: keyof NotificationPreferences, value: boolean) => {
      setPreferences((current) => (current ? { ...current, [key]: value } : current));
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!preferences) return;

    setIsSaving(true);
    try {
      const anyEnabled =
        preferences.dueDateReminders ||
        preferences.overdueAlerts ||
        preferences.contractReminders;

      if (anyEnabled) {
        const granted = await requestNotificationPermissions();
        if (!granted) {
          showToast({ message: t('errors.notificationPermission'), type: 'warning' });
        }
      }

      await saveNotificationPreferences(preferences);
      showToast({ message: t('settings.notificationsUpdated'), type: 'success' });
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : t('settings.saveFailed'),
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  }, [preferences, showToast, t]);

  if (isLoading || !preferences) {
    return (
      <StackScreenChrome title={t('settings.notificationPreferences')}>
        <SkeletonLoader count={4} className="p-4" />
      </StackScreenChrome>
    );
  }

  const items: Array<{
    key: keyof NotificationPreferences;
    title: string;
    hint: string;
  }> = [
    {
      key: 'dueDateReminders',
      title: t('settings.dueDateReminders'),
      hint: t('settings.dueDateRemindersHint'),
    },
    {
      key: 'overdueAlerts',
      title: t('settings.overdueAlerts'),
      hint: t('settings.overdueAlertsHint'),
    },
    {
      key: 'contractReminders',
      title: t('settings.contractReminders'),
      hint: t('settings.contractRemindersHint'),
    },
  ];

  return (
    <StackScreenChrome title={t('settings.notificationPreferences')}>
      <ScrollView contentContainerClassName="gap-6 p-4 pb-12">
        {items.map((item) => (
          <View key={item.key} className="flex-row items-center justify-between gap-4">
            <View className="flex-1 gap-1">
              <Text className="text-base font-medium">{item.title}</Text>
              <Text className="text-muted-foreground text-xs">{item.hint}</Text>
            </View>
            <Switch
              checked={preferences[item.key]}
              onCheckedChange={(value) => updatePreference(item.key, value)}
            />
          </View>
        ))}

        <AppButton mode="contained" onPress={handleSave} loading={isSaving}>
          {t('common.save')}
        </AppButton>
      </ScrollView>
    </StackScreenChrome>
  );
}
