// Stuurt het lid door naar Strava om toestemming te geven
import { authorizeUrl, stravaReady, safeReturn } from '@/lib/strava';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const url = new URL(req.url);
  const device = (url.searchParams.get('device') || '').slice(0, 64);
  if (!stravaReady) return Response.redirect(new URL('/challenge?strava=uit&why=' + encodeURIComponent('STRAVA_CLIENT_ID of STRAVA_CLIENT_SECRET ontbreekt in Vercel (of er is nog niet opnieuw gedeployd).'), url.origin));
  if (!device) return Response.redirect(new URL('/challenge?strava=fout', url.origin));
  // na het koppelen terug naar de pagina waar je vandaan kwam (5km Challenge of badges)
  // state = apparaat ~ terugpagina ~ adres waar het lid de app opende
  const next = url.searchParams.get('next') === 'badges' ? 'badges' : '';
  const from = safeReturn(url.origin);
  return Response.redirect(authorizeUrl([device, next, from].join('~')));
}
