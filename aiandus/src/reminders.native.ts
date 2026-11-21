import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { CROPS, METHOD, tallinnTime } from './calendar';
import type { Entry } from './journal';

export const remindersAvailable = true;
const channelId = 'sowing-reminders';
const prefix = 'kuukulv:';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false,
  }),
});

const hasPermission = (permission: Notifications.NotificationPermissionsStatus) =>
  permission.granted || permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

export async function enableReminders(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(channelId, {
      name: 'Külvimeeldetuletused', importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  if (hasPermission(await Notifications.getPermissionsAsync())) return true;
  return hasPermission(await Notifications.requestPermissionsAsync());
}

export async function syncReminders(entries: Entry[]): Promise<void> {
  const allowed = hasPermission(await Notifications.getPermissionsAsync());
  const desired = new Map<string, { entry: Entry; date: Date }>();
  for (const entry of entries) {
    if (!allowed || entry.kind !== 'planned' || !entry.reminder) continue;
    const date = tallinnTime(entry.day, 9);
    if (date.getTime() > Date.now()) desired.set(`${prefix}${entry.id}`, { entry, date });
  }
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    const { identifier, content } = notification;
    if (!identifier.startsWith(prefix)) continue;
    const planned = desired.get(identifier);
    if (planned && planned.date.getTime() === content.data?.at && planned.entry.cropId === content.data?.crop) {
      desired.delete(identifier);
    } else {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    }
  }
  for (const [identifier, { entry, date }] of desired) {
    const crop = CROPS.find(({ id }) => id === entry.cropId);
    if (!crop) continue;
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: entry.end ? `${crop.name} · külviperiood algab` : `${crop.name} · külvipäev`,
        body: METHOD[crop.method],
        data: { at: date.getTime(), crop: crop.id },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId },
    });
  }
}
