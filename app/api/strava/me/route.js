// Persoonlijke segmenttijden: alleen voor het eigen apparaat
import { linkFor, effortsFor, sync, disconnect, athleteStats, cachedStats, stravaReady, SEGMENT_ID } from '@/lib/strava';

export const dynamic = 'force-dynamic';

// quick: alleen wat al opgeslagen is (geen aanroepen naar Strava), zodat de pagina meteen opent
async function payload(device, extra = {}, { quick = false } = {}) {
  const link = await linkFor(device);
  let pr = null;
  if (link) {
    if (quick) pr = cachedStats(link);
    else { try { pr = await athleteStats(link); } catch { /* dan berekenen we de PR zelf */ } }
  }
  return {
    pr,
    configured: stravaReady,
    segment: { id: SEGMENT_ID, url: `https://www.strava.com/segments/${SEGMENT_ID}` },
    connected: Boolean(link),
    firstname: link?.firstname || '',
    lastSync: link?.last_sync || null,
    history: !link || !('history_before' in link) ? 'uit' : link.history_before === 1 ? 'klaar' : 'bezig',
    efforts: link ? await effortsFor(device) : [],
    ...extra,
  };
}

export async function GET(req) {
  const device = (new URL(req.url).searchParams.get('device') || '').slice(0, 64);
  if (!device) return Response.json({ error: 'Apparaat onbekend.' }, { status: 400 });
  return Response.json(await payload(device, {}, { quick: true }));
}

export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  const device = String(b.device || '').slice(0, 64);
  if (!device) return Response.json({ error: 'Apparaat onbekend.' }, { status: 400 });
  if (b.action === 'disconnect') {
    await disconnect(device);
    return Response.json(await payload(device));
  }
  if (b.action === 'sync') { // op de achtergrond, na het openen van de pagina
    const link = stravaReady ? await linkFor(device) : null;
    let note = null;
    if (link) {
      try {
        const r = await sync(link);
        if (r.more) note = 'Je oudere loopjes worden nog doorzocht. Kom straks nog eens kijken.';
      } catch (e) {
        note = e.soft ? e.message : 'Strava was even niet bereikbaar. Je ziet je laatst bekende tijden.';
      }
    }
    return Response.json(await payload(device, { note }));
  }
  if (b.action === 'refresh') {
    const link = await linkFor(device);
    if (!link) return Response.json({ error: 'Koppel eerst je Strava.' }, { status: 400 });
    try { await sync(link, { force: true }); } catch (e) {
      return Response.json(await payload(device, { note: e.soft ? e.message : 'Strava was even niet bereikbaar.' }));
    }
    return Response.json(await payload(device));
  }
  return Response.json({ error: 'Onbekende actie.' }, { status: 400 });
}
