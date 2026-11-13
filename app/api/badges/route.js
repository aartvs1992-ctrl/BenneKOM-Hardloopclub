// Badges van één lid: alleen voor het eigen apparaat (Strava-gegevens zijn alleen voor jezelf)
import { badgeState, scanStrava, checkin } from '@/lib/badgeScan';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const deviceOf = (v) => String(v || '').slice(0, 64);

export async function GET(req) {
  const device = deviceOf(new URL(req.url).searchParams.get('device'));
  if (!device) return Response.json({ error: 'Apparaat onbekend.' }, { status: 400 });
  return Response.json(await badgeState(device));
}

export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  const device = deviceOf(b.device);
  if (!device) return Response.json({ error: 'Apparaat onbekend.' }, { status: 400 });
  let note = null;
  if (b.action === 'sync') {
    try {
      const r = await scanStrava(device, { force: Boolean(b.force) });
      if (r.more) note = `${r.checked} loopjes doorzocht. Er zijn er nog meer: kom straks nog eens kijken.`;
      else if (b.force && r.checked != null) note = `${r.checked} activiteiten doorzocht, ${r.found} nieuwe trainingen of events gevonden.`;
      else if (b.force && r.skipped) note = r.skipped === 'geen koppeling' ? 'Strava is niet gekoppeld op dit account.' : null;
    } catch (e) {
      note = e.db ? e.message
        : e.soft ? e.message
        : 'Strava was even niet bereikbaar. Je ziet je laatst bekende badges. (' + String(e.message || e).slice(0, 120) + ')';
    }
  } else if (b.action === 'checkin') {
    try { await checkin(device, String(b.eventId || '').slice(0, 80)); }
    catch (e) { return Response.json({ error: /badge_log/.test(e.message) ? 'Inchecken werkt nog niet: de badges-tabel ontbreekt in de database.' : e.message }, { status: 400 }); }
  } else {
    return Response.json({ error: 'Onbekende actie.' }, { status: 400 });
  }
  return Response.json({ ...(await badgeState(device)), note });
}
