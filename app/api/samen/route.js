// Samen-pagina: clubcijfers uit de app + (alleen voor jezelf) je eigen Strava-week
import { clubTogether, myTogether } from '@/lib/samen';
import { stravaReady } from '@/lib/strava';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const device = (new URL(req.url).searchParams.get('device') || '').slice(0, 64);
  const club = await clubTogether().catch(() => null);
  let me = { connected: false, configured: stravaReady };
  if (device && stravaReady) {
    try { me = { ...(await myTogether(device)), configured: true }; }
    catch (e) { me = { connected: true, configured: true, error: e.soft ? e.message : 'Strava was even niet bereikbaar.' }; }
  }
  return Response.json({ club, me });
}
