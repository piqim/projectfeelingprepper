import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

const DAILY_CHECKIN_ID = 1;
const STREAK_PROTECTION_ID = 2;

export async function setupDailyReminder(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const { display } = await LocalNotifications.requestPermissions();
  if (display !== 'granted') return;

  const { notifications } = await LocalNotifications.getPending();
  if (notifications.some(n => n.id === DAILY_CHECKIN_ID)) return;

  await LocalNotifications.schedule({
    notifications: [{
      title: 'FeelingPrepper',
      body: 'Time to check in. How are you feeling today?',
      id: DAILY_CHECKIN_ID,
      schedule: { on: { hour: 20, minute: 0 }, repeats: true },
    }],
  });
}

export async function syncStreakProtection(hasCompletedToday: boolean): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  await LocalNotifications.cancel({ notifications: [{ id: STREAK_PROTECTION_ID }] });

  if (hasCompletedToday) return;

  const now = new Date();
  const fireAt = new Date();
  fireAt.setHours(21, 30, 0, 0);
  if (now >= fireAt) return;

  await LocalNotifications.schedule({
    notifications: [{
      title: 'FeelingPrepper',
      body: "Don't break your streak! Log your activities before midnight.",
      id: STREAK_PROTECTION_ID,
      schedule: { at: fireAt },
    }],
  });
}
