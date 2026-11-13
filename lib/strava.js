// Strava-koppeling voor de persoonlijke 5km Challenge.
// Werkwijze: een lid koppelt zijn eigen Strava; de app doorzoekt alleen zijn eigen
// hardloopactiviteiten rond het segment en bewaart zijn tijden op dat segment.
// Die tijden worden alleen aan het lid zelf getoond (Strava API-regels).
import { all, find, upsert, upsertMany, remove } from './db';

const API = 'https://www.strava.com/api/v3';
export const SEGMENT_ID = Number(process.env.STRAVA_SEGMENT_ID || 23298531);
export const stravaReady = Boolean(process.env.STRAVA_CLIENT_ID && process.env.STRAVA_CLIENT_SECRET);

const MAX_DETAIL_CALLS = 25;      // per synchronisatie, om binnen Strava's limieten te blijven
const SYNC_EVERY_MS = 5 * 60e3;   // niet vaker dan eens per 5 minuten per lid
const FIRST_SYNC_DAYS = 365;      // bij koppelen een jaar terugkijken

export function authorizeUrl(origin, device) {
  const p = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID,
    redirect_uri: `${origin}/api/strava/callback`,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'read,activity:read_all',
    state: device,
  });
  return `https://www.strava.com/oauth/authorize?${p}`;
}

async function tokenRequest(body) {
  const r = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: process.env.STRAVA_CLIENT_ID, client_secret: process.env.STRAVA_CLIENT_SECRET, ...body }),
    cache: 'no-store',
  });
  const j = await r.json();
  if (!r.ok || !j.access_token) {
    const detail = (j.errors || []).map((x) => [x.resource, x.field, x.code].filter(Boolean).join(' ')).join(', ');
    throw new Error([j.message || 'Strava gaf geen toegang', detail].filter(Boolean).join(' – '));
  }
  return j;
}

// Code uit de terugkoppeling inwisselen en de koppeling opslaan
export async function connect(device, code, scope) {
  if (!String(scope || '').includes('activity:read')) throw new Error('Zonder toegang tot je activiteiten kan de app je segmenttijden niet vinden.');
  const t = await tokenRequest({ code, grant_type: 'authorization_code' });
  // één Strava-account hoort bij één apparaat: oude koppeling van dit account opruimen
  for (const l of (await all('strava_links')).filter((x) => x.athlete_id === t.athlete.id && x.device_id !== device)) {
    await remove('strava_links', { device_id: l.device_id });
  }
  const link = {
    device_id: device,
    athlete_id: t.athlete.id,
    firstname: t.athlete.firstname || '',
    access_token: t.access_token,
    refresh_token: t.refresh_token,
    expires_at: t.expires_at,
    synced_until: null,
    last_sync: null,
  };
  await upsert('strava_links', link, ['device_id']);
  return link;
}

export async function freshToken(link) {
  if (link.expires_at - 120 > Date.now() / 1000) return link.access_token;
  const t = await tokenRequest({ grant_type: 'refresh_token', refresh_token: link.refresh_token });
  Object.assign(link, { access_token: t.access_token, refresh_token: t.refresh_token, expires_at: t.expires_at });
  await upsert('strava_links', link, ['device_id']);
  return link.access_token;
}

export async function get(token, path) {
  const r = await fetch(API + path, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (r.status === 429) throw Object.assign(new Error('Strava is even te druk. Probeer het over een kwartier opnieuw.'), { soft: true });
  if (!r.ok) throw new Error(`Strava antwoordde met ${r.status}.`);
  return r.json();
}

let segmentCache = null;
export async function segmentInfo(token) {
  if (segmentCache) return segmentCache;
  const s = await get(token, `/segments/${SEGMENT_ID}`);
  segmentCache = { id: s.id, name: s.name, distance: s.distance, start: s.start_latlng, end: s.end_latlng, city: s.city };
  return segmentCache;
}

const effortRow = (link, e, activityId) => ({
  id: e.id, device_id: link.device_id, athlete_id: link.athlete_id, activity_id: activityId,
  segment_id: SEGMENT_ID, elapsed_time: e.elapsed_time, start_date: e.start_date,
});
const saveEfforts = (rows) => upsertMany('strava_efforts', rows, ['id']);

// Taken met maximaal `n` tegelijk uitvoeren (sneller dan één voor één, maar Strava-vriendelijk)
async function pool(items, n, fn) {
  const out = []; let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k]); }
  }));
  return out;
}

// Je officiële all-time PR op het segment, rechtstreeks van Strava (10 min. bewaard)
const statsCache = new Map();
export function cachedStats(link) {
  return statsCache.get(link.device_id)?.v ?? null;
}
export async function athleteStats(link) {
  const hit = statsCache.get(link.device_id);
  if (hit && Date.now() - hit.t < 10 * 60e3) return hit.v;
  const token = await freshToken(link);
  const s = await get(token, `/segments/${SEGMENT_ID}`);
  const a = s.athlete_segment_stats || {};
  const v = a.pr_elapsed_time
    ? { seconds: a.pr_elapsed_time, date: a.pr_date, activity: a.pr_activity_id ? String(a.pr_activity_id) : null, count: a.effort_count || null }
    : null;
  statsCache.set(link.device_id, { t: Date.now(), v });
  return v;
}

// Alle pogingen in één keer (werkt als het lid een Strava-abonnement heeft); anders null
async function allEfforts(link, token) {
  try {
    let n = 0;
    for (let page = 1; page <= 3; page++) {
      const batch = await get(token, `/segment_efforts?segment_id=${SEGMENT_ID}&per_page=200&page=${page}`);
      if (!Array.isArray(batch)) return null;
      await saveEfforts(batch.map((e) => effortRow(link, e, e.activity?.id))); n += batch.length;
      if (batch.length < 200) break;
    }
    return n;
  } catch {
    return null;
  }
}

export function km(a, b) {
  if (!a?.length || !b?.length) return 0;
  const R = 6371, t = Math.PI / 180;
  const dLat = (b[0] - a[0]) * t, dLon = (b[1] - a[1]) * t;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * t) * Math.cos(b[0] * t) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Google-polyline (de route-samenvatting die Strava bij elke activiteit meestuurt) omzetten naar punten
export function decodePolyline(str) {
  const pts = []; let i = 0, lat = 0, lng = 0;
  while (i < str.length) {
    for (const k of [0, 1]) {
      let b, shift = 0, result = 0;
      do { b = str.charCodeAt(i++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20 && i < str.length);
      const d = result & 1 ? ~(result >> 1) : result >> 1;
      if (k === 0) lat += d; else lng += d;
    }
    pts.push([lat / 1e5, lng / 1e5]);
  }
  return pts;
}

// Kleinste afstand (km) van punt p tot de route (lijnstukken tussen de punten)
export function distToRoute(p, pts) {
  const t = Math.PI / 180, kx = 111.32 * Math.cos(p[0] * t), ky = 110.57;
  let best = Infinity;
  for (let j = 0; j < pts.length; j++) {
    const ax = (pts[j][1] - p[1]) * kx, ay = (pts[j][0] - p[0]) * ky;
    if (j === 0) { best = Math.min(best, Math.hypot(ax, ay)); continue; }
    const bx = (pts[j - 1][1] - p[1]) * kx, by = (pts[j - 1][0] - p[0]) * ky;
    const dx = ax - bx, dy = ay - by, len = dx * dx + dy * dy;
    const u = len ? Math.max(0, Math.min(1, -(bx * dx + by * dy) / len)) : 0;
    best = Math.min(best, Math.hypot(bx + u * dx, by + u * dy));
  }
  return best;
}

// Kan deze activiteit over het segment gegaan zijn? Scheelt veel aanroepen bij Strava.
// Met routekaart: alleen als de route langs het begin of het eind van het segment komt
// (of, want een privacyzone rond iemands huis kan een stuk van de route verbergen).
export function isCandidate(a, seg) {
  const type = a.sport_type || a.type || '';
  if (!/run/i.test(type)) return false;
  if (seg.distance && a.distance < seg.distance * 0.9) return false;
  if (a.start_latlng?.length && seg.start?.length && km(a.start_latlng, seg.start) > 15) return false;
  const line = a.map?.summary_polyline;
  if (line && seg.start?.length && seg.end?.length) {
    try {
      const pts = decodePolyline(line);
      if (pts.length > 1) return distToRoute(seg.start, pts) < 0.15 || distToRoute(seg.end, pts) < 0.15;
    } catch { /* dan de ruime controle hierboven */ }
  }
  return true;
}

// Nieuwe activiteiten doorzoeken op tijden op het segment
export async function sync(link, { force = false } = {}) {
  if (!force && link.last_sync && Date.now() - new Date(link.last_sync).getTime() < SYNC_EVERY_MS) return { skipped: true };
  const token = await freshToken(link);
  statsCache.delete(link.device_id);
  const seg = await segmentInfo(token);
  const full = await allEfforts(link, token); // met abonnement: complete historie
  const after = link.synced_until || Math.floor(Date.now() / 1000) - FIRST_SYNC_DAYS * 86400;

  const acts = [];
  for (let page = 1; page <= 4; page++) {
    const batch = await get(token, `/athlete/activities?after=${after}&per_page=100&page=${page}`);
    acts.push(...batch);
    if (batch.length < 100) break;
  }
  acts.sort((a, b) => a.start_date.localeCompare(b.start_date));

  // Alleen activiteiten die over het segment kunnen gaan; maximaal MAX_DETAIL_CALLS per keer
  let until = after, more = false;
  const todo = [];
  for (const a of acts) {
    if (isCandidate(a, seg)) {
      if (todo.length >= MAX_DETAIL_CALLS) { more = true; break; }
      todo.push(a);
    }
    until = Math.max(until, Math.floor(new Date(a.start_date).getTime() / 1000));
  }
  // Daarna, met wat er nog over is, terug in de tijd zoeken naar loopjes van langer dan een jaar geleden.
  // Werkt alleen als de kolom history_before bestaat (supabase/018_strava_historie.sql).
  let backTo = null;
  if (full == null && 'history_before' in link && link.history_before !== 1 && !more && todo.length < MAX_DETAIL_CALLS) {
    let before = link.history_before || Math.floor(Date.now() / 1000) - FIRST_SYNC_DAYS * 86400;
    let done = false;
    outer: for (let page = 1; page <= 10; page++) {
      const batch = await get(token, `/athlete/activities?before=${before}&per_page=100&page=1`);
      if (!batch.length) { done = true; break; }
      batch.sort((a, b) => b.start_date.localeCompare(a.start_date)); // nieuwste eerst
      for (const a of batch) {
        if (isCandidate(a, seg)) {
          if (todo.length >= MAX_DETAIL_CALLS) { more = true; break outer; }
          todo.push(a);
        }
        before = Math.floor(new Date(a.start_date).getTime() / 1000);
      }
      if (batch.length < 100) { done = true; break; }
    }
    if (!done) more = true;
    backTo = done ? 1 : before;
  }

  const details = await pool(todo, 5, (a) => get(token, `/activities/${a.id}?include_all_efforts=true`));
  const rows = [];
  details.forEach((d, k) => {
    for (const e of d.segment_efforts || []) if (Number(e.segment?.id) === SEGMENT_ID) rows.push(effortRow(link, e, todo[k].id));
  });
  await saveEfforts(rows);
  const calls = todo.length, found = rows.length;
  Object.assign(link, { synced_until: until, last_sync: new Date().toISOString() });
  if (backTo != null) link.history_before = backTo;
  await upsert('strava_links', link, ['device_id']);
  return { checked: calls, found: found + (full || 0), more };
}

export async function linkFor(device) {
  return (await find('strava_links', { device_id: device }).catch(() => []))[0] || null;
}

export async function effortsFor(device) {
  return (await find('strava_efforts', { device_id: device }).catch(() => []))
    .map((e) => ({ id: String(e.id), seconds: e.elapsed_time, date: e.start_date, activity: String(e.activity_id), source: 'strava' }));
}

export async function disconnect(device) {
  const link = await linkFor(device);
  if (!link) return;
  try {
    const token = await freshToken(link);
    await fetch('https://www.strava.com/oauth/deauthorize', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
  } catch { /* ook als Strava niet antwoordt, verwijderen we alles */ }
  await remove('strava_efforts', { device_id: device });
  await remove('badge_log', { device_id: device, source: 'strava' }).catch(() => {}); // badges uit Strava-loopjes
  await remove('strava_links', { device_id: device });
}
