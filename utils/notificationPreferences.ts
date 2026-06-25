import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_PREFS_KEY = '@stanapp/notification_prefs';

export interface NotificationPreferences {
  dueDateReminders: boolean;
  overdueAlerts: boolean;
  contractReminders: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  dueDateReminders: true,
  overdueAlerts: true,
  contractReminders: true,
};

export async function loadNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function saveNotificationPreferences(
  preferences: NotificationPreferences,
): Promise<void> {
  await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(preferences));
}
