// Strava stuurt het lid hier terug na het geven (of weigeren) van toestemming
import { connect, sync } from '@/lib/strava';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const url = new URL(req.url);
  const back = (status) => Response.redirect(new URL(`/challenge?strava=${status}`, url.origin));
  if (url.searchParams.get('error')) return back('geweigerd');
  const code = url.searchParams.get('code');
  const device = (url.searchParams.get('state') || '').slice(0, 64);
  if (!code || !device) return back('fout');
  try {
    const link = await connect(device, code, url.searchParams.get('scope'));
    try { await sync(link, { force: true }); } catch { /* tijden komen dan bij de volgende keer */ }
    return back('ok');
  } catch {
    return back('fout');
  }
}
