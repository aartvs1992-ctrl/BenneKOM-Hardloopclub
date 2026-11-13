// Server: aanwezigheid vastleggen voor de badges. Twee bronnen:
// 1. Strava — de app doorzoekt de eigen loopjes van het lid op dinsdagtrainingen en events.
// 2. Inchecken — "Ik was erbij" in de app, alleen op de dag zelf en alleen als je je had aangemeld.
// Alles staat in de tabel badge_log (supabase/025_badges.sql) en is alleen zichtbaar voor het lid zelf.
import { all, find, upsert, upsertMany, remove } from './db';
import { CLUB, todayISO, withTrainings } from './club';
import { BADGE_EVENTS, CLUB_START, computeBadges, recentTuesdays, weekday, isLastSaturday, isClubDay } from './badges';
import { linkFor, freshToken, get, km, decodePolyline, distToRoute, sync as syncSegment, stravaReady } from './strava';

const SCAN_EVERY_MS = 15 * 60e3; // per lid niet vaker dan eens per kwartier naar Strava
const MAX_PAGES = 10;            // 10 × 200 loopjes per keer; de rest bij de volgende keer
const RULES_KEY = 'meta:regels-2'; // ophogen als de herkenning verandert
const scanned = globalThis.__bkBadgeScan || (globalThis.__bkBadgeScan = new Map());

const toMin = (hm) => { const [h, m] = String(hm || '0:0').split(':').map(Number); return h * 60 + (m || 0); };
const fromMin = (n) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;

// Tijdvak van de training op een dinsdag: de begintijd van een event dat de training vervangt, anders de vaste tijd
function trainingWindow(date, events) {
  const rep = events.find((e) => e.date === date && e.replaces_training && e.time);
  const t = toMin(rep?.time || CLUB.trainingTime);
  return [fromMin(t - 60), fromMin(t + 30)]; // ook wie vanaf huis naar de start loopt
}

// Liep je samen met anderen? Strava herkent groepsloopjes (athlete_count = aantal lopers in de groep).
const inGroup = (a) => (a.athlete_count || 1) >= 2;

// Komt de route langs een verzamelplek van de club?
function passesMeetPoint(a) {
  const r = CLUB.meetRadiusKm;
  const line = a.map?.summary_polyline;
  if (line) {
    try {
      const pts = decodePolyline(line);
      if (pts.length) return CLUB.meetPoints.some((m) => distToRoute(m.at, pts) <= r);
    } catch { /* dan op het startpunt */ }
  }
  return Boolean(a.start_latlng?.length) && CLUB.meetPoints.some((m) => km(a.start_latlng, m.at) <= r);
}

// Welke badge-sleutels levert dit loopje op?
export function keysForActivity(a, events) {
  const type = a.sport_type || a.type || '';
  if (!/run/i.test(type) || /virtual/i.test(type)) return [];
  const local = String(a.start_date_local || '');
  const date = local.slice(0, 10), hm = local.slice(11, 16);
  if (!date || date < CLUB_START) return [];
  // Alleen loopjes die Strava als groepsloop herkent: zo weten we zeker dat je met clubgenoten liep
  if (!inGroup(a)) return [];
  const keys = [];
  if (isClubDay(date)) {
    const [from, to] = trainingWindow(date, events);
    if (hm >= from && hm <= to && passesMeetPoint(a)) keys.push('training-' + date);
  }
  const inBennekom = passesMeetPoint(a) || (a.start_latlng?.length && km(a.start_latlng, CLUB.trainingLatLng) <= CLUB.trainingRadiusKm);
  for (const ev of BADGE_EVENTS) if (ev.date === date && hm >= ev.from && hm <= ev.to && inBennekom) keys.push('event:' + ev.key);
  return keys;
}

// Nieuwe Strava-loopjes doorzoeken. Geeft { more } terug als er nog oudere loopjes over zijn.
export async function scanStrava(device, { force = false } = {}) {
  if (!stravaReady) return { skipped: 'uit' };
  const link = await linkFor(device);
  if (!link) return { skipped: 'geen koppeling' };
  if (!force && Date.now() - (scanned.get(device) || 0) < SCAN_EVERY_MS) return { skipped: 'net gedaan' };

  const token = await freshToken(link);
  const events = await all('events').catch(() => []);
  // Nieuwe regels voor het herkennen van trainingen? Dan de Strava-regels opnieuw opbouwen.
  // ("Nu bijwerken" doet dat ook altijd, zodat alles met de laatste regels is berekend.)
  const existing = await find('badge_log', { device_id: device });
  if (force || !existing.some((r) => r.key === RULES_KEY)) {
    await remove('badge_log', { device_id: device, source: 'strava' });
    link.badges_until = null;
  }
  const start = Math.floor(new Date(CLUB_START + 'T00:00:00Z').getTime() / 1000);
  // Strava zet loopjes soms pas later online (horloge synchroniseert de volgende dag): 3 dagen overlap
  let after = Math.max(start, (link.badges_until || start) - 3 * 86400);
  let more = false, newest = link.badges_until || start, checked = 0;
  const rows = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = await get(token, `/athlete/activities?after=${after}&per_page=200&page=${page}`);
    checked += batch.length;
    for (const a of batch) {
      for (const key of keysForActivity(a, events)) {
        rows.push({ device_id: device, key, date: a.start_date_local.slice(0, 10), source: 'strava', activity_id: a.id });
      }
      newest = Math.max(newest, Math.floor(new Date(a.start_date).getTime() / 1000));
    }
    if (batch.length < 200) break;
    if (page === MAX_PAGES) more = true;
  }
  // Een check-in blijft staan; Strava vult aan. Per training/event één regel, ook als je die avond
  // twee loopjes hebt (bv. inlopen en de training apart opgenomen): dubbele regels in één keer
  // opslaan weigert de database.
  const have = new Set((await find('badge_log', { device_id: device })).map((r) => r.key));
  if (!have.has(RULES_KEY)) rows.push({ device_id: device, key: RULES_KEY, date: todayISO(), source: 'meta', activity_id: null });
  const fresh = [...new Map(rows.filter((r) => !have.has(r.key)).map((r) => [r.key, r])).values()];
  try {
    await upsertMany('badge_log', fresh, ['device_id', 'key']);
  } catch (e) {
    throw Object.assign(new Error('Opslaan van je badges lukte niet: ' + e.message), { db: true });
  }
  scanned.set(device, Date.now()); // pas na een geslaagde scan even pauzeren; mislukt hij, dan de volgende keer opnieuw
  try { await upsert('strava_links', { ...link, badges_until: newest }, ['device_id']); } catch { /* kolom ontbreekt: dan zoekt hij de volgende keer opnieuw */ }
  // De 5km Challenge-tijden ook bijwerken (loopt zelf niet vaker dan eens per 5 minuten)
  try { await syncSegment(link); } catch { /* tijden komen dan later */ }
  return { found: fresh.filter((r) => r.source !== 'meta').length, checked, more };
}

// "Ik was erbij": alleen op de dag zelf, vanaf een half uur voor de start, en alleen als je je had aangemeld
export async function checkin(device, eventId) {
  const today = todayISO();
  const raw = await all('events');
  const ev = withTrainings(raw).find((e) => e.id === eventId);
  if (!ev) throw new Error('Dit evenement bestaat niet (meer).');
  if (ev.date !== today) throw new Error('Inchecken kan alleen op de dag zelf.');
  const now = new Intl.DateTimeFormat('nl-NL', { timeZone: 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
  if (ev.time && toMin(now) < toMin(ev.time) - 30) throw new Error(`Inchecken kan vanaf een half uur voor de start (${ev.time}).`);
  const signed = await find('participants', { event_id: ev.id, device_id: device });
  if (!signed.length) throw new Error('Meld je eerst aan met "Ik ben erbij".');
  const keys = [];
  if (ev.type === 'training' || (ev.replaces_training && weekday(ev.date) === CLUB.trainingDay)) keys.push('training-' + ev.date);
  for (const b of BADGE_EVENTS) if (b.eventIds.includes(ev.id)) keys.push('event:' + b.key);
  if (!keys.length) throw new Error('Bij dit evenement hoort geen badge.');
  await upsertMany('badge_log', keys.map((key) => ({ device_id: device, key, date: ev.date, source: 'checkin', activity_id: null })), ['device_id', 'key']);
  return keys;
}

// Alles voor de badges-pagina van één lid
export async function badgeState(device) {
  const today = todayISO();
  const [log, link, efforts, results, profile] = await Promise.all([
    find('badge_log', { device_id: device }).then((r) => ({ ok: true, rows: r })).catch((e) => ({ ok: false, rows: [], err: e.message })),
    linkFor(device).catch(() => null),
    find('strava_efforts', { device_id: device }).catch(() => []),
    find('challenge_results', { device_id: device }).catch(() => []),
    find('profiles', { device_id: device }).then((r) => r[0]).catch(() => null),
  ]);
  const challenges = [
    // alleen pogingen op Challenge-dagen (laatste zaterdag van de maand), niet elk rondje over het segment
    ...efforts.map((e) => ({ date: new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam' }).format(new Date(e.start_date)), seconds: e.elapsed_time }))
      .filter((e) => isLastSaturday(e.date)),
    ...results.filter((r) => /^\d{4}-\d{2}-\d{2}$/.test(r.edition || '')).map((r) => ({ date: r.edition, seconds: r.seconds })),
  ];
  const rows = log.rows.map((r) => ({ key: r.key, date: r.date, source: r.source }));
  return {
    ready: log.ok,
    setup: log.ok ? null : 'De badges-tabel ontbreekt nog: draai supabase/025_badges.sql in Supabase.',
    configured: stravaReady,
    connected: Boolean(link),
    badges: computeBadges({ log: rows, challenges, memberSince: profile?.member_since || '', today }),
    tuesdays: recentTuesdays(rows, today),
    sources: Object.fromEntries(rows.map((r) => [r.key, r.source])),
    today,
  };
}
