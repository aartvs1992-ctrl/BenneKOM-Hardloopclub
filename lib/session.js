// Inlogsessie in een beveiligde cookie (httpOnly, 1 jaar geldig), naast de gegevens in de browser.
// Wist een telefoon het lokale geheugen (Safari doet dat soms na een week), dan herkent de app je via deze cookie.
import crypto from 'crypto';

const SECRET = process.env.AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VAPID_PRIVATE_KEY || 'bennekom-dev';
const NAME = 'bk_session';
const MAX_AGE = 365 * 24 * 3600;
const sign = (s) => crypto.createHmac('sha256', SECRET).update('session:' + s).digest('base64url');

export function sessionCookie(device) {
  const v = encodeURIComponent(device) + '.' + sign(device);
  return `${NAME}=${v}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`;
}

export const clearSessionCookie = () => `${NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;

export function readSession(req) {
  const raw = (req.headers.get('cookie') || '').split(/;\s*/).find((c) => c.startsWith(NAME + '='));
  if (!raw) return null;
  const v = raw.slice(NAME.length + 1);
  const i = v.lastIndexOf('.');
  if (i < 1) return null;
  const device = decodeURIComponent(v.slice(0, i));
  const sig = v.slice(i + 1);
  const ok = sig.length === sign(device).length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(sign(device)));
  return ok ? device : null;
}
