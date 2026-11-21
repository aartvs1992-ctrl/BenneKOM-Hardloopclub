// Jaaroverzicht (Wrapped) van één lid: alleen voor het eigen apparaat
import { wrapped, DEMO } from '@/lib/wrapped';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(req) {
  const q = new URL(req.url).searchParams;
  if (q.has('demo')) return Response.json(DEMO);
  const device = String(q.get('device') || '').slice(0, 64);
  if (!device) return Response.json({ error: 'Apparaat onbekend.' }, { status: 400 });
  try { return Response.json(await wrapped(device)); }
  catch (e) { return Response.json({ error: 'Je jaaroverzicht laden lukte niet. Probeer het straks opnieuw.' }, { status: 500 }); }
}
