import { Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Switch, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/ui/AppButton';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Spacing, Typography } from '@/constants/theme';
import { requestNotificationPermissions } from '@/lib/notifications';
import { useUiStore } from '@/stores/uiStore';
import {
  loadNotificationPreferences,
  saveNotificationPreferences,
  type NotificationPreferences,
} from '@/utils/notificationPreferences';

export default function NotificationSettingsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
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
      <>
        <Stack.Screen options={{ title: t('settings.notificationPreferences') }} />
        <SkeletonLoader count={4} style={styles.loader} />
      </>
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
    <>
      <Stack.Screen options={{ title: t('settings.notificationPreferences') }} />

      <ScrollView contentContainerStyle={styles.content}>
        {items.map((item) => (
          <View key={item.key} style={styles.row}>
            <View style={styles.text}>
              <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                {item.title}
              </Text>
              <Text style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
                {item.hint}
              </Text>
            </View>
            <Switch
              value={preferences[item.key]}
              onValueChange={(value) => updatePreference(item.key, value)}
            />
          </View>
        ))}

        <AppButton mode="contained" onPress={handleSave} loading={isSaving}>
          {t('common.save')}
        </AppButton>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  loader: {
    padding: Spacing.md,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  text: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    ...Typography.titleMedium,
  },
  hint: {
    ...Typography.bodySmall,
  },
});
