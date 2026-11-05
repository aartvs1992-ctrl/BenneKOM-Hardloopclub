import { all, fileUrl, update } from './db';

// Alle profielen als kaart device_id → { name, avatar }
export async function profileMap() {
  const rows = await all('profiles').catch(() => []); // tabel bestaat nog niet → geen profielen
  const map = {};
  for (const p of rows) map[p.device_id] = publicProfile(p);
  return map;
}

export function displayName(p) {
  return [p.first_name, p.last_name].filter(Boolean).join(' ').trim();
}

export function publicProfile(p) {
  return {
    name: displayName(p), first: p.first_name, avatar: p.photo_path ? fileUrl(p.photo_path) : null,
    song: p.song || '', since: p.member_since || '', fact: p.fun_fact || '', work: p.work || '', best: p.best_run || '',
  };
}

// Laatst actief bijhouden (hooguit eens per 6 uur per lid, om de database niet te belasten).
// Werkt pas als de kolom last_seen bestaat (017_leden.sql); anders gebeurt er stil niets.
const touched = globalThis.__bkTouched || (globalThis.__bkTouched = new Map());
export async function touchProfile(device) {
  const now = Date.now();
  if (now - (touched.get(device) || 0) < 6 * 3600e3) return;
  touched.set(device, now);
  await update('profiles', { device_id: device }, { last_seen: new Date(now).toISOString() });
}
