// Clubgenoten: iedereen met een profiel, met foto, antwoorden op de vragen en een handle voor badges en berichten.
// Alleen voor leden met een profiel. Apparaat-id's gaan nooit mee.
import { profileMap } from '@/lib/profiles';
import { handle, offSet } from '@/lib/messages';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const device = String(new URL(req.url).searchParams.get('device') || '').slice(0, 64);
  const [profiles, off] = await Promise.all([profileMap(), offSet().catch(() => new Set())]);
  if (!device || !profiles[device]) return Response.json({ error: 'Maak eerst een profiel aan.' }, { status: 401 });
  const dmOn = !off.has(device);
  const members = Object.entries(profiles)
    .filter(([, p]) => p.name)
    .map(([d, p]) => ({
      ...p,
      me: d === device,
      bh: d === device ? null : handle(d),
      dm: d !== device && dmOn && !off.has(d) ? handle(d) : null,
    }))
    .sort((a, b) => (b.avatar ? 1 : 0) - (a.avatar ? 1 : 0) || a.name.localeCompare(b.name, 'nl'));
  return Response.json({ members });
}
