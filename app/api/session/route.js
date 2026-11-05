// Wie ben ik? Geeft het account terug dat bij de inlogcookie hoort (GET), of logt uit (POST).
import { all } from '@/lib/db';
import { readSession, clearSessionCookie } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const device = readSession(req);
  if (!device) return Response.json({});
  try {
    const p = (await all('profiles')).find((x) => x.device_id === device);
    if (!p) return Response.json({}, { headers: { 'Set-Cookie': clearSessionCookie() } });
    return Response.json({ device, name: [p.first_name, p.last_name].filter(Boolean).join(' ') });
  } catch {
    return Response.json({});
  }
}

export async function POST() {
  return Response.json({ ok: true }, { headers: { 'Set-Cookie': clearSessionCookie() } });
}
