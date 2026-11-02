// Strava stuurt het lid hier terug na het geven (of weigeren) van toestemming
import { connect, sync } from '@/lib/strava';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const url = new URL(req.url);
  const back = (status, why = '') => Response.redirect(new URL(`/challenge?strava=${status}${why ? '&why=' + encodeURIComponent(why.slice(0, 160)) : ''}`, url.origin));
  if (url.searchParams.get('error')) return back('geweigerd', url.searchParams.get('error'));
  const code = url.searchParams.get('code');
  const device = (url.searchParams.get('state') || '').slice(0, 64);
  if (!code || !device) return back('fout');
  try {
    const link = await connect(device, code, url.searchParams.get('scope'));
    try { await sync(link, { force: true }); } catch { /* tijden komen dan bij de volgende keer */ }
    return back('ok');
  } catch (e) {
    const msg = String(e?.message || e);
    const why = /strava_links|does not exist|schema cache/i.test(msg) ? 'De database mist de Strava-tabel: draai 003_strava.sql in Supabase.'
      : /limit|capacity/i.test(msg) ? 'De Strava-koppeling heeft haar maximum aantal leden bereikt.'
      : /client|secret|invalid/i.test(msg) ? 'Strava herkent de Client ID of Client Secret niet. Controleer ze in Vercel.'
      : 'Strava zei: ' + msg;
    return back('fout', why);
  }
}
