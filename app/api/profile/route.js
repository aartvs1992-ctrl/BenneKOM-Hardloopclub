// Ledenprofiel: naam en profielfoto, gekoppeld aan dit toestel.
// Met de herstelcode open je hetzelfde profiel op een ander toestel.
import { all, upsert, remove, putFile, deleteFile, fileUrl } from '@/lib/db';
import { displayName } from '@/lib/profiles';
import { mailReady, makeCode, checkCode, sendCodeMail } from '@/lib/mailcode';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const dynamic = 'force-dynamic';

const clean = (s, max = 60) => String(s ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
const bad = (msg, status = 400) => Response.json({ error: msg }, { status });
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // zonder 0/O en 1/I
const newCode = () => Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => ALPHA[b % ALPHA.length]).join('');

async function find(device) {
  return (await all('profiles')).find((p) => p.device_id === device) || null;
}

function own(p) {
  if (!p) return { profile: null };
  return {
    profile: {
      first_name: p.first_name, last_name: p.last_name,
      song: p.song || '', member_since: p.member_since || '', fun_fact: p.fun_fact || '', work: p.work || '', best_run: p.best_run || '',
      name: displayName(p), avatar: p.photo_path ? fileUrl(p.photo_path) : null,
      restore_code: p.restore_code, email: p.email || '',
    },
  };
}

export async function GET(req) {
  const device = clean(new URL(req.url).searchParams.get('device'), 64);
  if (!device) return bad('Apparaat onbekend.');
  try { return Response.json(own(await find(device))); }
  catch { return Response.json({ profile: null, setup: true }); }
}

export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { return bad('De foto is te groot. Probeer een andere.'); }
  const device = clean(b.device, 64);

  try {
    if (b.action === 'restore') {
      const code = clean(b.code, 12).toUpperCase().replace(/[^A-Z0-9]/g, '');
      const p = (await all('profiles')).find((x) => x.restore_code === code);
      if (!p) return bad('Deze code kennen we niet. Controleer hem en probeer het opnieuw.');
      return Response.json({ device: p.device_id, ...own(p) });
    }

    if (!device) return bad('Apparaat onbekend. Herlaad de app.');

    // Stap 1: code per mail. Bestaat het e-mailadres al, dan is het inloggen op dat profiel.
    if (b.action === 'sendCode') {
      const email = clean(b.email, 120).toLowerCase();
      if (!EMAIL.test(email)) return bad('Vul een geldig e-mailadres in.');
      const existing = (await all('profiles')).find((p) => (p.email || '').toLowerCase() === email);
      const first = clean(b.first_name, 40);
      if (!existing && !first) return bad(b.login ? 'Dit e-mailadres kennen we nog niet. Meld je aan met je naam.' : 'Vul je voornaam in.');
      if (!mailReady) return Response.json({ skip: true }); // bevestiging staat (nog) uit
      const { code, token } = makeCode({ email, first, last: clean(b.last_name, 60), device });
      try { await sendCodeMail(email, code, existing?.first_name || first, new URL(req.url).origin); }
      catch (e) { console.error(e); return bad('De mail kon niet worden verstuurd. Probeer het later nog eens.', 502); }
      return Response.json({ token, existing: Boolean(existing) });
    }

    // Stap 2: code invullen
    if (b.action === 'verify') {
      const r = checkCode(b.token, b.code);
      if (r.error) return bad(r.error);
      const { email, first, last } = r.payload;
      const existing = (await all('profiles')).find((p) => (p.email || '').toLowerCase() === email);
      if (existing) return Response.json({ device: existing.device_id, ...own(existing) });
      const row = {
        device_id: device, first_name: first, last_name: last || '', email,
        song: '', member_since: '', fun_fact: '', work: '', best_run: '',
        photo_path: null, restore_code: newCode(), updated_at: new Date().toISOString(),
      };
      await upsert('profiles', row, ['device_id']);
      return Response.json({ device, ...own(row) });
    }

    const current = await find(device);

    if (b.action === 'delete') {
      if (current?.photo_path) await deleteFile(current.photo_path).catch(() => {});
      await remove('profiles', { device_id: device });
      return Response.json({ profile: null });
    }

    if (b.action !== 'save') return bad('Onbekende actie.');
    const first = clean(b.first_name, 40);
    if (!first) return bad('Vul je voornaam in.');
    const email = clean(b.email, 120).toLowerCase();
    if (!current && mailReady) return bad('Bevestig eerst je e-mailadres met de code.');
    if (!current && !EMAIL.test(email)) return bad('Vul een geldig e-mailadres in.');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad('Dit e-mailadres klopt niet.');
    const row = {
      device_id: device,
      first_name: first,
      last_name: clean(b.last_name, 60),
      song: clean(b.song, 80),
      member_since: /^\d{4}-\d{2}$/.test(b.member_since || '') ? b.member_since : '',
      fun_fact: clean(b.fun_fact, 200),
      work: clean(b.work, 80),
      best_run: clean(b.best_run, 200),
      email: email || current?.email || '',
      photo_path: current?.photo_path || null,
      restore_code: current?.restore_code || newCode(),
      updated_at: new Date().toISOString(),
    };

    if (b.removePhoto && row.photo_path) {
      await deleteFile(row.photo_path).catch(() => {});
      row.photo_path = null;
    }
    if (b.photo) {
      const m = /^data:(image\/jpeg);base64,(.+)$/.exec(b.photo);
      if (!m) return bad('Dit bestand is geen foto.');
      const buf = Buffer.from(m[2], 'base64');
      if (buf.length > 600 * 1024) return bad('Deze foto is te groot.');
      const path = `avatars/${device.slice(0, 12)}-${Date.now()}.jpg`;
      await putFile(path, buf, m[1]);
      if (row.photo_path) await deleteFile(row.photo_path).catch(() => {});
      row.photo_path = path;
    }

    try { await upsert('profiles', row, ['device_id']); }
    catch (e) {
      // e-mailkolom nog niet aangemaakt in Supabase: dan in elk geval de rest opslaan
      if (!/email/i.test(String(e.message))) throw e;
      const { email: _e, ...rest } = row;
      await upsert('profiles', rest, ['device_id']);
    }
    return Response.json(own(row));
  } catch (e) {
    const msg = String(e.message);
    if (/(song|member_since|fun_fact|work|best_run)'? column|column .*(song|member_since|fun_fact|work|best_run)/i.test(msg)) return bad('De profielvragen zijn nog niet ingesteld: draai updates.sql in Supabase.', 500);
    if (/table .*profiles|relation .*profiles|does not exist/i.test(msg)) return bad('Profielen zijn nog niet ingesteld: draai 004_profielen.sql in Supabase.', 500);
    return bad('Opslaan lukte niet. Probeer het nog eens.', 500);
  }
}
