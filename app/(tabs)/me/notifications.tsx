import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { StackScreenChrome, useStackChromeEdgeInset } from '@/components/ui/StackScreenChrome';
import { Switch } from '@/components/ui/switch';
import { Spacing, Typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { requestNotificationPermissions } from '@/lib/notifications';
import { displayFontFamily, Fonts } from '@/lib/fonts';
import { useUiStore } from '@/stores/uiStore';
import {
  loadNotificationPreferences,
  saveNotificationPreferences,
  type NotificationPreferences,
} from '@/utils/notificationPreferences';

export default function NotificationSettingsScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors, elevation, radius } = theme;
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
        <SkeletonLoader count={4} style={styles.loader} />
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
        radius={radius}
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
  radius,
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
  radius: ReturnType<typeof useAppTheme>['theme']['radius'];
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
        style={{
          fontFamily: displayFontFamily(themeName),
          fontSize: 32,
          lineHeight: 32,
          letterSpacing: -0.8,
          color: colors.fg,
          marginBottom: 24,
        }}
      >
        {t('settings.notifications')}
      </Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.cardBd,
            borderRadius: radius.xl,
            ...elevation.card,
          },
        ]}
      >
        {items.map((item, index) => (
          <View key={item.key}>
            {index > 0 ? (
              <View style={[styles.divider, { backgroundColor: colors.bd }]} />
            ) : null}
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text
                  style={{
                    fontFamily: Fonts.sans.medium,
                    fontSize: Typography.text.settingsRow.size,
                    letterSpacing: -0.15,
                    color: colors.fg,
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.sans.regular,
                    fontSize: Typography.text.caption.size,
                    lineHeight: 16,
                    color: colors.muted,
                    marginTop: 3,
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
        style={[
          styles.saveBtn,
          { backgroundColor: colors.primary, opacity: isSaving ? 0.7 : 1 },
        ]}
      >
        <Text
          style={{
            fontFamily: Fonts.sans.semibold,
            fontSize: 15,
            letterSpacing: -0.15,
            color: colors.onPrimary,
          }}
        >
          {t('common.save')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: {
    padding: Spacing.md,
  },
  card: {
    paddingHorizontal: 18,
    paddingVertical: 4,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 22,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  saveBtn: {
    height: 50,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
