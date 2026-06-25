import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { EXPENSE_REMINDER_DAYS } from '@/constants/config';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type NotificationData = {
  expenseId?: string;
  rentPaymentId?: string;
  type: 'expense_due' | 'expense_overdue' | 'rent_due';
};

function buildExpenseNotificationId(expenseId: string, daysBefore: number): string {
  return `expense-${expenseId}-${daysBefore}d`;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'StanApp Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleExpenseDueReminder(
  expenseId: string,
  dueDate: Date,
  title: string,
  body: string,
): Promise<void> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  await cancelExpenseReminders(expenseId);

  for (const daysBefore of EXPENSE_REMINDER_DAYS) {
    const triggerDate = new Date(dueDate);
    triggerDate.setDate(triggerDate.getDate() - daysBefore);
    triggerDate.setHours(9, 0, 0, 0);

    if (triggerDate <= new Date()) continue;

    await Notifications.scheduleNotificationAsync({
      identifier: buildExpenseNotificationId(expenseId, daysBefore),
      content: {
        title,
        body,
        data: { expenseId, type: 'expense_due' } satisfies NotificationData,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
  }
}

export async function scheduleExpenseOverdueNotification(
  expenseId: string,
  dueDate: Date,
  title: string,
  body: string,
): Promise<void> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  const triggerDate = new Date(dueDate);
  triggerDate.setDate(triggerDate.getDate() + 1);
  triggerDate.setHours(9, 0, 0, 0);

  if (triggerDate <= new Date()) return;

  await Notifications.scheduleNotificationAsync({
    identifier: `expense-${expenseId}-overdue`,
    content: {
      title,
      body,
      data: { expenseId, type: 'expense_overdue' } satisfies NotificationData,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
}

export async function cancelExpenseReminders(expenseId: string): Promise<void> {
  const identifiers = [
    ...EXPENSE_REMINDER_DAYS.map((days) => buildExpenseNotificationId(expenseId, days)),
    `expense-${expenseId}-overdue`,
  ];

  await Promise.all(
    identifiers.map((identifier) =>
      Notifications.cancelScheduledNotificationAsync(identifier).catch(() => undefined),
    ),
  );

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    const data = notification.content.data as NotificationData | undefined;
    if (data?.expenseId === expenseId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

export async function scheduleRentDueReminder(
  rentPaymentId: string,
  dueDate: Date,
  title: string,
  body: string,
): Promise<void> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  const triggerDate = new Date(dueDate);
  triggerDate.setDate(triggerDate.getDate() - 3);
  triggerDate.setHours(9, 0, 0, 0);

  if (triggerDate <= new Date()) return;

  await Notifications.scheduleNotificationAsync({
    identifier: `rent-${rentPaymentId}`,
    content: {
      title,
      body,
      data: { rentPaymentId, type: 'rent_due' } satisfies NotificationData,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
}

export async function cancelRentReminder(rentPaymentId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(`rent-${rentPaymentId}`).catch(
    () => undefined,
  );
}

export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledNotifications() {
  return Notifications.getAllScheduledNotificationsAsync();
}
