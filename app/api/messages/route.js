// Berichten tussen leden. Alleen voor leden met een profiel, en alleen tussen leden die berichten aan hebben staan.
import { after } from 'next/server';
import { find, insert, update, upsert } from '@/lib/db';
import { profileMap } from '@/lib/profiles';
import { handle, openSet } from '@/lib/messages';
import { sendPush } from '@/lib/push';

export const dynamic = 'force-dynamic';

const clean = (s, max) => String(s ?? '').trim().slice(0, max);
const bad = (msg, status = 400) => Response.json({ error: msg }, { status });
const setupMsg = 'Berichten zijn nog niet ingesteld: draai 020_berichten.sql in Supabase.';

// Alles wat de berichtenpagina nodig heeft; met `withH` ook het gesprek met dat lid
async function view(device, withH) {
  const [profiles, open, inbox, outbox] = await Promise.all([
    profileMap(), openSet(), find('messages', { to_device: device }), find('messages', { from_device: device }),
  ]);
  const byHandle = {};
  for (const d of Object.keys(profiles)) byHandle[handle(d)] = d;
  const card = (d) => ({ id: handle(d), name: profiles[d]?.name || 'Oud-lid', first: profiles[d]?.first || '', avatar: profiles[d]?.avatar || null, open: open.has(d) });

  const msgs = [...inbox, ...outbox].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
  const threads = {};
  for (const m of msgs) {
    const other = m.from_device === device ? m.to_device : m.from_device;
    const t = (threads[other] ||= { ...card(other), unread: 0 });
    t.last = m.body; t.at = m.created_at; t.mineLast = m.from_device === device;
    if (m.to_device === device && !m.read_at) t.unread++;
  }
  const out = {
    open: open.has(device),
    threads: Object.values(threads).sort((a, b) => String(b.at).localeCompare(String(a.at))),
    members: open.has(device)
      ? Object.keys(profiles).filter((d) => d !== device && open.has(d)).map(card).sort((a, b) => a.name.localeCompare(b.name, 'nl'))
      : [],
  };
  if (withH) {
    const other = byHandle[withH];
    if (!other || other === device) return { ...out, notFound: true };
    out.with = card(other);
    out.messages = msgs.filter((m) => m.from_device === other || m.to_device === other)
      .map((m) => ({ id: m.id, body: m.body, at: m.created_at, mine: m.from_device === device, read: Boolean(m.read_at) }));
    const unreadIds = msgs.filter((m) => m.from_device === other && m.to_device === device && !m.read_at);
    if (unreadIds.length) await update('messages', { from_device: other, to_device: device }, { read_at: new Date().toISOString() }).catch(() => {});
  }
  return out;
}

async function member(device) {
  if (!device) return null;
  return (await profileMap())[device] || null;
}

export async function GET(req) {
  const q = new URL(req.url).searchParams;
  const device = clean(q.get('device'), 64);
  if (!(await member(device))) return bad('Maak eerst een profiel aan.', 401);
  try { return Response.json(await view(device, clean(q.get('with'), 32))); }
  catch { return bad(setupMsg, 500); }
}

export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { return bad('Ongeldig verzoek.'); }
  const device = clean(b.device, 64);
  const me = await member(device);
  if (!me) return bad('Maak eerst een profiel aan.', 401);
  try {
    if (b.action === 'open') {
      await upsert('dm_settings', { device_id: device, open: Boolean(b.on), updated_at: new Date().toISOString() }, ['device_id']);
      return Response.json(await view(device, clean(b.with, 32)));
    }
    if (b.action === 'send') {
      const body = clean(b.body, 1000);
      if (!body) return bad('Typ eerst een bericht.');
      const open = await openSet();
      if (!open.has(device)) return bad('Zet eerst berichten aan om te kunnen sturen.');
      const profiles = await profileMap();
      const to = Object.keys(profiles).find((d) => handle(d) === clean(b.to, 32));
      if (!to || to === device) return bad('Dit lid bestaat niet (meer).');
      if (!open.has(to)) return bad(`${profiles[to].first || 'Dit lid'} ontvangt geen berichten.`);
      // rem op spam: hooguit 30 berichten per 10 minuten
      const recent = (await find('messages', { from_device: device })).filter((m) => Date.now() - new Date(m.created_at).getTime() < 10 * 60e3);
      if (recent.length >= 30) return bad('Even rustig aan: probeer het over een paar minuten opnieuw.');
      await insert('messages', { from_device: device, to_device: to, body });
      after(() => sendPush('berichten', { title: `Bericht van ${me.first || me.name}`, body: body.length > 120 ? body.slice(0, 117) + '…' : body, url: '/berichten/' + handle(device) }, null, to).catch(() => {}));
      return Response.json(await view(device, handle(to)));
    }
    return bad('Onbekende actie.');
  } catch {
    return bad(setupMsg, 500);
  }
}
