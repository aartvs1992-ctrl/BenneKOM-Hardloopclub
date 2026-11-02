// Strava-koppeling voor de persoonlijke 5km Challenge.
// Werkwijze: een lid koppelt zijn eigen Strava; de app doorzoekt alleen zijn eigen
// hardloopactiviteiten rond het segment en bewaart zijn tijden op dat segment.
// Die tijden worden alleen aan het lid zelf getoond (Strava API-regels).
import { all, upsert, remove } from './db';

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
  if (!r.ok || !j.access_token) throw new Error(j.message || 'Strava gaf geen toegang.');
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

async function freshToken(link) {
  if (link.expires_at - 120 > Date.now() / 1000) return link.access_token;
  const t = await tokenRequest({ grant_type: 'refresh_token', refresh_token: link.refresh_token });
  Object.assign(link, { access_token: t.access_token, refresh_token: t.refresh_token, expires_at: t.expires_at });
  await upsert('strava_links', link, ['device_id']);
  return link.access_token;
}

async function get(token, path) {
  const r = await fetch(API + path, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (r.status === 429) throw Object.assign(new Error('Strava is even te druk. Probeer het over een kwartier opnieuw.'), { soft: true });
  if (!r.ok) throw new Error(`Strava antwoordde met ${r.status}.`);
  return r.json();
}

let segmentCache = null;
export async function segmentInfo(token) {
  if (segmentCache) return segmentCache;
  const s = await get(token, `/segments/${SEGMENT_ID}`);
  segmentCache = { id: s.id, name: s.name, distance: s.distance, start: s.start_latlng, city: s.city };
  return segmentCache;
}

function km(a, b) {
  if (!a?.length || !b?.length) return 0;
  const R = 6371, t = Math.PI / 180;
  const dLat = (b[0] - a[0]) * t, dLon = (b[1] - a[1]) * t;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * t) * Math.cos(b[0] * t) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Kan deze activiteit over het segment gegaan zijn? Scheelt veel aanroepen bij Strava.
export function isCandidate(a, seg) {
  const type = a.sport_type || a.type || '';
  if (!/run/i.test(type)) return false;
  if (seg.distance && a.distance < seg.distance * 0.9) return false;
  if (a.start_latlng?.length && seg.start?.length && km(a.start_latlng, seg.start) > 15) return false;
  return true;
}

// Nieuwe activiteiten doorzoeken op tijden op het segment
export async function sync(link, { force = false } = {}) {
  if (!force && link.last_sync && Date.now() - new Date(link.last_sync).getTime() < SYNC_EVERY_MS) return { skipped: true };
  const token = await freshToken(link);
  const seg = await segmentInfo(token);
  const after = link.synced_until || Math.floor(Date.now() / 1000) - FIRST_SYNC_DAYS * 86400;

  const acts = [];
  for (let page = 1; page <= 4; page++) {
    const batch = await get(token, `/athlete/activities?after=${after}&per_page=100&page=${page}`);
    acts.push(...batch);
    if (batch.length < 100) break;
  }
  acts.sort((a, b) => a.start_date.localeCompare(b.start_date));

  let calls = 0, until = after, found = 0, more = false;
  for (const a of acts) {
    if (isCandidate(a, seg)) {
      if (calls >= MAX_DETAIL_CALLS) { more = true; break; }
      calls++;
      const detail = await get(token, `/activities/${a.id}?include_all_efforts=true`);
      for (const e of detail.segment_efforts || []) {
        if (Number(e.segment?.id) !== SEGMENT_ID) continue;
        await upsert('strava_efforts', {
          id: e.id, device_id: link.device_id, athlete_id: link.athlete_id, activity_id: a.id,
          segment_id: SEGMENT_ID, elapsed_time: e.elapsed_time, start_date: e.start_date,
        }, ['id']);
        found++;
      }
    }
    until = Math.max(until, Math.floor(new Date(a.start_date).getTime() / 1000));
  }
  Object.assign(link, { synced_until: until, last_sync: new Date().toISOString() });
  await upsert('strava_links', link, ['device_id']);
  return { checked: calls, found, more };
}

export async function linkFor(device) {
  return (await all('strava_links').catch(() => [])).find((l) => l.device_id === device) || null;
}

export async function effortsFor(device) {
  return (await all('strava_efforts').catch(() => []))
    .filter((e) => e.device_id === device)
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
  await remove('strava_links', { device_id: device });
}
