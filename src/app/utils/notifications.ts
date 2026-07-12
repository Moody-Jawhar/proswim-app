import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export interface StoredNotification {
  id: string;
  title: string;
  body: string;
  receivedAt: string;
  read: boolean;
  data?: Record<string, string>;
}

const STORAGE_KEY = 'pswm_notifications';
let _counter = 0;

// ─── Local inbox (stores push notifications received on device) ───────────────

export function getStoredNotifications(): StoredNotification[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function saveNotifications(notifications: StoredNotification[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, 50)));
}

export function addNotification(n: Omit<StoredNotification, 'id' | 'receivedAt' | 'read'>): void {
  const existing = getStoredNotifications();
  const notification: StoredNotification = {
    ...n,
    id: `${Date.now()}-${++_counter}`,
    receivedAt: new Date().toISOString(),
    read: false,
  };
  saveNotifications([notification, ...existing]);
}

export function markAllRead(): void {
  saveNotifications(getStoredNotifications().map(n => ({ ...n, read: true })));
}

export function getUnreadCount(): number {
  return getStoredNotifications().filter(n => !n.read).length;
}

export function clearAllNotifications(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Topic subscription ───────────────────────────────────────────────────────

export async function subscribeToStudentTopic(studentId: number): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await FirebaseMessaging.subscribeToTopic({ topic: `student_${studentId}` });
  } catch (e) {
    console.error('Topic subscribe failed:', e);
  }
}

export async function unsubscribeFromStudentTopic(studentId: number): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await FirebaseMessaging.unsubscribeFromTopic({ topic: `student_${studentId}` });
  } catch (e) {
    console.error('Topic unsubscribe failed:', e);
  }
}

// ─── Push registration & listeners ───────────────────────────────────────────

export async function initPushNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { receive } = await FirebaseMessaging.requestPermissions();
    if (receive !== 'granted') return;

    await LocalNotifications.requestPermissions();

    // Foreground message — store it AND show a system banner
    FirebaseMessaging.addListener('notificationReceived', async (event) => {
      const n = event.notification;
      addNotification({
        title: n.title || 'ProSwim',
        body: n.body || '',
        data: n.data as Record<string, string> | undefined,
      });
      // Display as a visible banner while the app is open
      try {
        await LocalNotifications.schedule({
          notifications: [{
            id: Date.now() % 2147483647,
            title: n.title || 'ProSwim',
            body: n.body || '',
            smallIcon: 'ic_launcher',
          }],
        });
      } catch { /* ignore if local notifications not available */ }
    });

    // Notification tapped (background / quit)
    FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
      const n = event.notification;
      addNotification({
        title: n.title || 'ProSwim',
        body: n.body || '',
        data: n.data as Record<string, string> | undefined,
      });
    });

    // Re-subscribe to the student topic if already logged in
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (user.studentId) {
        await subscribeToStudentTopic(user.studentId);
      }
    } catch { /* not logged in yet */ }

  } catch (e) {
    console.error('Push notification init failed:', e);
  }
}
