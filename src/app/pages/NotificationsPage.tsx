import { useState, useEffect } from 'react';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { Bell, Loader2, AlertCircle } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import {
  getStoredNotifications,
  markAllRead,
  type StoredNotification,
} from '../utils/notifications';
import { getNotifications, type NotificationDto } from '../api/pswmApi';

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface DisplayNotification {
  id: string;
  title: string;
  body: string;
  receivedAt: string;
}

function fromApi(n: NotificationDto): DisplayNotification {
  return {
    id: `api-${n.pushNotificationId}`,
    title: n.type || 'ProSwim',
    body: n.desc || '',
    receivedAt: n.date,
  };
}

function fromLocal(n: StoredNotification): DisplayNotification {
  return { id: n.id, title: n.title, body: n.body, receivedAt: n.receivedAt };
}

export function NotificationsPage() {
  const [items, setItems] = useState<DisplayNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    markAllRead();

    (async () => {
      try {
        const apiItems = (await getNotifications()).map(fromApi);
        const localItems = getStoredNotifications().map(fromLocal);

        // Merge: deduplicate by id, sort newest first
        const seen = new Set<string>();
        const merged = [...apiItems, ...localItems]
          .filter(n => seen.has(n.id) ? false : (seen.add(n.id), true))
          .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());

        setItems(merged);
      } catch {
        // Fall back to local only
        const localItems = getStoredNotifications().map(fromLocal);
        if (localItems.length === 0) setError('Could not load notifications.');
        setItems(localItems);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent pb-nav">
        <MobileHeader title="Notifications" showBack />
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="size-8 text-[#1e5c97] animate-spin" />
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-nav">
      <MobileHeader title="Notifications" showBack />
      <PageHero title="Notifications" subtitle="Announcements & session reminders" slide={4} />
      <div className="px-4 pt-3 pb-4 space-y-3">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl p-4">
            <AlertCircle className="size-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {items.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Bell className="size-8 text-slate-300" />
            </div>
            <p className="text-sm text-slate-400">No notifications yet</p>
            <p className="text-xs text-slate-300 text-center px-8">
              You'll see session reminders and announcements from ProSwim here
            </p>
          </div>
        )}

        {items.map((n) => (
          <div
            key={n.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4"
          >
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: '#e8f0f8' }}
              >
                <Bell className="size-4" style={{ color: '#1e5c97' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                {n.body && (
                  <p className="text-sm text-slate-500 mt-0.5 leading-snug">{n.body}</p>
                )}
                <p className="text-xs font-medium text-[#1e5c97] mt-1.5">ProSwim Admin Team</p>
                <p className="text-xs text-slate-400 mt-0.5">{timeAgo(n.receivedAt)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <MobileNav />
    </div>
  );
}
