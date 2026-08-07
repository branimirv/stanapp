import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { StackScreenChrome, useStackChromeEdgeInset } from '@/components/ui/StackScreenChrome';
import { Switch } from '@/components/ui/switch';
import { Spacing, Typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { requestNotificationPermissions } from '@/lib/notifications';
import { displayFontFamily } from '@/lib/fonts';
import { useUiStore } from '@/stores/uiStore';
import {
  loadNotificationPreferences,
  saveNotificationPreferences,
  type NotificationPreferences,
} from '@/utils/notificationPreferences';

export default function NotificationSettingsScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors, elevation } = theme;
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
      <StackScreenChrome title={t('settings.notificationPreferences')} hideHeaderTitle edgeToEdge>
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
    <StackScreenChrome title={t('settings.notificationPreferences')} hideHeaderTitle edgeToEdge>
      <NotificationBody
        items={items}
        preferences={preferences}
        isSaving={isSaving}
        colors={colors}
        elevation={elevation}
        themeName={theme.name}
        onToggle={updatePreference}
        onSave={handleSave}
        t={t}
      />
    </StackScreenChrome>
  );
}

function NotificationBody({
  items,
  preferences,
  isSaving,
  colors,
  elevation,
  themeName,
  onToggle,
  onSave,
  t,
}: {
  items: Array<{ key: keyof NotificationPreferences; title: string; hint: string }>;
  preferences: NotificationPreferences;
  isSaving: boolean;
  colors: ReturnType<typeof useAppTheme>['theme']['colors'];
  elevation: ReturnType<typeof useAppTheme>['theme']['elevation'];
  themeName: 'dark' | 'light';
  onToggle: (key: keyof NotificationPreferences, value: boolean) => void;
  onSave: () => void;
  t: (key: string) => string;
}) {
  const edgeInset = useStackChromeEdgeInset() ?? 0;

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: Spacing.gutter,
        paddingTop: edgeInset + Spacing.sm,
        paddingBottom: Spacing.scrollBottom,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text
        className="text-fg mb-6 text-[32px] tracking-[-0.8px]"
        style={{
          fontFamily: displayFontFamily(themeName),
          lineHeight: 32,
        }}
      >
        {t('settings.notifications')}
      </Text>

      <View
        className="border-card-bd bg-surface mb-5.5 rounded-xl border px-4.5 py-1"
        style={[{ borderWidth: StyleSheet.hairlineWidth }, elevation.card]}
      >
        {items.map((item, index) => (
          <View key={item.key}>
            {index > 0 ? (
              <View className="bg-bd" style={{ height: StyleSheet.hairlineWidth }} />
            ) : null}
            <View className="flex-row items-center gap-3 py-3.5">
              <View className="min-w-0 flex-1">
                <Text
                  className="text-fg font-medium tracking-[-0.15px]"
                  style={{ fontSize: Typography.text.settingsRow.size }}
                >
                  {item.title}
                </Text>
                <Text
                  className="text-muted mt-0.75"
                  style={{
                    fontSize: Typography.text.caption.size,
                    lineHeight: 16,
                  }}
                >
                  {item.hint}
                </Text>
              </View>
              <Switch
                checked={preferences[item.key]}
                onCheckedChange={(value) => onToggle(item.key, value)}
              />
            </View>
          </View>
        ))}
      </View>

      <Pressable
        onPress={onSave}
        disabled={isSaving}
        accessibilityRole="button"
        accessibilityLabel={t('common.save')}
        className="bg-primary h-[50px] items-center justify-center rounded-full"
        style={{ opacity: isSaving ? 0.7 : 1 }}
      >
        <Text className="text-on-primary text-[15px] font-semibold tracking-[-0.15px]">
          {t('common.save')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
