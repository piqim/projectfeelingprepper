import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

// Each notification owns a stable id so it can be individually cancelled and
// rescheduled without disturbing the others.
const DAILY_CHECKIN_ID = 1;
const STREAK_PROTECTION_ID = 2;
const PET_STATUS_ID = 3;
const STREAK_MILESTONE_ID = 4;
const RE_ENGAGEMENT_ID = 5;

// Streak lengths worth celebrating with a congratulatory notification.
const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 180, 365];
// Tracks the highest milestone already celebrated so we never fire it twice.
const LAST_MILESTONE_KEY = 'fp_last_celebrated_milestone';
// How long the user can be away before the gentle re-engagement nudge fires.
const RE_ENGAGEMENT_DELAY_DAYS = 3;

// Local mirror of the server-side `notifications` preference, so scheduling can
// be gated synchronously without a network round-trip. Home seeds this from the
// fetched user; Settings updates it when the toggle changes.
const NOTIF_PREF_KEY = 'fp_notifications_enabled';
const ALL_NOTIFICATION_IDS = [
  DAILY_CHECKIN_ID,
  STREAK_PROTECTION_ID,
  PET_STATUS_ID,
  STREAK_MILESTONE_ID,
  RE_ENGAGEMENT_ID,
];

/** Whether the user has notifications enabled (defaults to on when unset). */
export function notificationsEnabled(): boolean {
  return localStorage.getItem(NOTIF_PREF_KEY) !== 'false';
}

/**
 * Mirrors the server preference locally and, when turned off, immediately
 * cancels every pending reminder. Scheduling resumes automatically once the
 * preference is on again (driven by Home's effect).
 */
export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  localStorage.setItem(NOTIF_PREF_KEY, String(enabled));
  if (!Capacitor.isNativePlatform()) return;
  if (!enabled) {
    await LocalNotifications.cancel({
      notifications: ALL_NOTIFICATION_IDS.map(id => ({ id })),
    });
  }
}

/**
 * Requests notification permission (a no-op prompt after the first grant on iOS)
 * and returns true only when the user has allowed alerts.
 */
async function ensurePermission(): Promise<boolean> {
  const { display } = await LocalNotifications.requestPermissions();
  return display === 'granted';
}

/**
 * Daily 8:00 PM habit nudge. Scheduled once and left repeating; we bail early if
 * it's already pending so reopening the app doesn't stack duplicates.
 */
export async function setupDailyReminder(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  if (!notificationsEnabled()) return;
  if (!(await ensurePermission())) return;

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

/**
 * Streak-protection nudge at 9:30 PM, only when today is still incomplete.
 * Re-evaluated on every screen that can complete an activity, so it's cancelled
 * the moment the user logs something and never fires on a completed day.
 */
export async function syncStreakProtection(hasCompletedToday: boolean): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  await LocalNotifications.cancel({ notifications: [{ id: STREAK_PROTECTION_ID }] });

  if (!notificationsEnabled()) return;
  if (hasCompletedToday) return;

  const now = new Date();
  const fireAt = new Date();
  fireAt.setHours(21, 30, 0, 0);
  if (now >= fireAt) return;
  if (!(await ensurePermission())) return;

  await LocalNotifications.schedule({
    notifications: [{
      title: 'FeelingPrepper',
      body: "Don't break your streak! Log your activities before midnight.",
      id: STREAK_PROTECTION_ID,
      schedule: { at: fireAt },
    }],
  });
}

/**
 * Pet-companion reminder. The pet turns "sad" 24 h after its last feed
 * (mirrors getDerivedPetStatus), so we pre-schedule a gentle nudge for that
 * exact moment. Feeding refreshes lastFed, which reschedules this later.
 */
export async function syncPetReminder(lastFed?: string | Date | null): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  await LocalNotifications.cancel({ notifications: [{ id: PET_STATUS_ID }] });

  if (!notificationsEnabled()) return;
  // No feed history → the pet is already sad; the daily reminder covers this.
  if (!lastFed) return;

  const sadAt = new Date(new Date(lastFed).getTime() + 24 * 60 * 60 * 1000);
  if (sadAt <= new Date()) return; // already sad — nothing left to pre-warn about
  if (!(await ensurePermission())) return;

  await LocalNotifications.schedule({
    notifications: [{
      title: 'Your companion misses you',
      body: 'Your pet is getting lonely 🥺 Check in to cheer them up.',
      id: PET_STATUS_ID,
      schedule: { at: sadAt },
    }],
  });
}

/**
 * Celebrates the highest newly-reached streak milestone with a positive
 * notification — balancing the loss-framed daily/streak nudges. Fires at most
 * once per milestone, and resets so milestones can be re-earned after a break.
 */
export async function celebrateStreakMilestone(streak: number): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  if (!notificationsEnabled()) return;

  const lastCelebrated = Number(localStorage.getItem(LAST_MILESTONE_KEY) ?? 0);

  // Streak reset (broke and started over) → allow milestones to fire again.
  if (streak < lastCelebrated) {
    localStorage.setItem(LAST_MILESTONE_KEY, String(streak));
    return;
  }

  const reached = STREAK_MILESTONES.filter(m => streak >= m && m > lastCelebrated);
  if (reached.length === 0) return;

  const milestone = Math.max(...reached);
  localStorage.setItem(LAST_MILESTONE_KEY, String(milestone));
  if (!(await ensurePermission())) return;

  await LocalNotifications.schedule({
    notifications: [{
      title: `${milestone}-day streak! 🔥`,
      body: `You've checked in ${milestone} days in a row. That's real commitment to yourself 💜`,
      id: STREAK_MILESTONE_ID,
      schedule: { at: new Date(Date.now() + 1000) },
    }],
  });
}

/**
 * Gentle re-engagement nudge after a lapse. Pushed back on every app open, so
 * it only fires once the user has been away RE_ENGAGEMENT_DELAY_DAYS in a row.
 * Intentionally low-pressure for a mental-wellness audience.
 */
export async function syncReEngagementReminder(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  await LocalNotifications.cancel({ notifications: [{ id: RE_ENGAGEMENT_ID }] });

  if (!notificationsEnabled()) return;
  const fireAt = new Date(Date.now() + RE_ENGAGEMENT_DELAY_DAYS * 24 * 60 * 60 * 1000);
  if (!(await ensurePermission())) return;

  await LocalNotifications.schedule({
    notifications: [{
      title: "We're here whenever you're ready",
      body: 'Your check-in space is waiting 🌱 No pressure — come back when it feels right.',
      id: RE_ENGAGEMENT_ID,
      schedule: { at: fireAt },
    }],
  });
}
