// Feedback uit de app: komt per mail binnen bij Aart (zie sendFeedbackMail).
import { all } from '@/lib/db';
import { displayName } from '@/lib/profiles';
import { mailReady, sendFeedbackMail } from '@/lib/mailcode';

export const dynamic = 'force-dynamic';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (s, max) => String(s ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
const bad = (msg, status = 400) => Response.json({ error: msg }, { status });

// eenvoudige rem tegen spam: max 5 berichten per toestel per uur (per serverinstantie)
const hits = globalThis.__bkFeedback || (globalThis.__bkFeedback = new Map());

export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { return bad('Er ging iets mis. Probeer het opnieuw.'); }
  if (b.website) return Response.json({ ok: true }); // honeypot: bots vullen dit in

  const message = String(b.message ?? '').trim().slice(0, 3000);
  if (message.length < 3) return bad('Schrijf even wat je kwijt wilt.');
  const device = clean(b.device, 64);

  const key = device || req.headers.get('x-forwarded-for') || 'anon';
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < 3600e3);
  if (recent.length >= 5) return bad('Je hebt net al een paar berichten gestuurd. Probeer het later nog eens.', 429);
  hits.set(key, [...recent, now]);

  if (!mailReady) return bad('Feedback versturen werkt op dit moment niet. Probeer het later nog eens.', 503);

  // Ben je aangemeld, dan nemen we je naam en e-mail uit je profiel.
  let name = clean(b.name, 80);
  let email = clean(b.email, 120).toLowerCase();
  if (device) {
    try {
      const p = (await all('profiles')).find((x) => x.device_id === device);
      if (p) { name = displayName(p) || name; email = (p.email || email).toLowerCase(); }
    } catch { /* geen profiel: gebruik wat is ingevuld */ }
  }
  if (email && !EMAIL.test(email)) email = '';

  try {
    await sendFeedbackMail({ name, email, message, page: clean(b.page, 200) });
  } catch (e) {
    console.error(e);
    return bad('Je bericht kon niet worden verstuurd. Probeer het later nog eens.', 502);
  }
  return Response.json({ ok: true });
}
