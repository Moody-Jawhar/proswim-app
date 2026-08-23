import { Preferences } from '@capacitor/preferences';

const KEY = 'deviceId';

/** Stable per-install identifier for once-per-device verification. */
export function getDeviceId(): string {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(KEY, id);
    Preferences.set({ key: KEY, value: id }).catch(() => {});
  }
  return id;
}

/** Boot-time: recover the id from the native store if web storage was purged
 *  (otherwise a purge would re-gate an already-verified device). */
export async function restoreDeviceId(): Promise<void> {
  try {
    if (localStorage.getItem(KEY)) return;
    const { value } = await Preferences.get({ key: KEY });
    if (value) localStorage.setItem(KEY, value);
  } catch { /* plain browser without the plugin */ }
}
