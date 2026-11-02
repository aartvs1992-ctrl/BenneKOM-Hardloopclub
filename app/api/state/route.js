import { buildState } from '@/lib/state';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const device = new URL(req.url).searchParams.get('device') || '';
  try {
    return Response.json(await buildState(device));
  } catch (e) {
    return Response.json({ error: 'De gegevens konden niet worden geladen.' }, { status: 500 });
  }
}
