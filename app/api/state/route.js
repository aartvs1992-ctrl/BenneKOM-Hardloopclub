import { buildState } from '@/lib/state';
import { sessionCookie, readSession } from '@/lib/session';
import { touchProfile } from '@/lib/profiles';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const device = new URL(req.url).searchParams.get('device') || '';
  try {
    const state = await buildState(device);
    const headers = {};
    if (state.me) {
      // ingelogd: cookie (her)zetten, zodat dit apparaat je blijft herkennen
      if (readSession(req) !== device) headers['Set-Cookie'] = sessionCookie(device);
      touchProfile(device).catch(() => {});
    }
    return Response.json(state, { headers });
  } catch (e) {
    return Response.json({ error: 'De gegevens konden niet worden geladen.' }, { status: 500 });
  }
}
