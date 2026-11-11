// Berichten tussen leden. Staat standaard aan; een lid kan het zelf uitzetten en is dan niet bereikbaar.
// Leden zien elkaars apparaat-id nooit: in de app heet iedereen hier een 'handle' (afgeleid, niet terug te rekenen).
import crypto from 'crypto';
import { all, find } from './db';

const SECRET = process.env.AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VAPID_PRIVATE_KEY || 'bennekom-dev';
export const handle = (device) => crypto.createHmac('sha256', SECRET).update('dm:' + device).digest('base64url').slice(0, 16);

// Alle leden die berichten ontvangen: Set van apparaat-id's.
// Berichten staan standaard aan; alleen wie het zelf heeft uitgezet (open = false) doet niet mee.
export async function openSet() {
  const [profiles, rows] = await Promise.all([all('profiles').catch(() => []), all('dm_settings').catch(() => [])]);
  const off = new Set(rows.filter((r) => !r.open).map((r) => r.device_id));
  return new Set(profiles.map((p) => p.device_id).filter((d) => !off.has(d)));
}

export async function unreadCount(device) {
  if (!device) return 0;
  const rows = await find('messages', { to_device: device }).catch(() => []);
  return rows.filter((m) => !m.read_at).length;
}
