import webpush from 'web-push';
import { all, remove } from './db';

const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const priv = process.env.VAPID_PRIVATE_KEY;
export const pushReady = Boolean(pub && priv);
if (pushReady) webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:info@hardloopclubbennekom.nl', pub, priv);

// Meldingen die alleen komen als iemand ze zelf aanzet
const OFF_BY_DEFAULT = ['shirt', 'samenloop'];

// Stuur een melding naar iedereen die dit type aan heeft staan.
// excludeDevice: niet naar de afzender. onlyDevice: alleen naar dit apparaat.
export async function sendPush(prefKey, payload, excludeDevice = null, onlyDevice = null) {
  if (!pushReady) return { sent: 0, skipped: 'Pushmeldingen zijn nog niet ingesteld (VAPID-sleutels ontbreken).' };
  const subs = (await all('push_subscriptions')).filter((s) =>
    (s.prefs?.[prefKey] ?? !OFF_BY_DEFAULT.includes(prefKey)) &&
    (!excludeDevice || s.device_id !== excludeDevice) &&
    (!onlyDevice || s.device_id === onlyDevice));
  let sent = 0;
  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification(s.subscription, JSON.stringify(payload));
      sent++;
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) await remove('push_subscriptions', { endpoint: s.endpoint });
    }
  }));
  return { sent };
}
