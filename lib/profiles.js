import { all, fileUrl } from './db';

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
    song: p.song || '', since: p.member_since || '', fact: p.fun_fact || '', work: p.work || '',
  };
}
