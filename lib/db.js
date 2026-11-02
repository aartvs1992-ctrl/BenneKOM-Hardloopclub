// Server-only opslaglaag. Met SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY praat hij met Supabase,
// zonder die variabelen gebruikt hij een tijdelijke opslag in het geheugen met voorbeelddata
// (handig om lokaal te testen; verdwijnt bij een herstart).
import { createClient } from '@supabase/supabase-js';
import { SEED_EVENTS, SEED_NEWS } from './seed';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const usingSupabase = Boolean(url && key);

const sb = usingSupabase ? createClient(url, key, { auth: { persistSession: false } }) : null;

const mem = globalThis.__bkMem || (globalThis.__bkMem = {
  events: SEED_EVENTS.map((e) => ({ ...e })),
  participants: [],
  rides: [],
  ride_passengers: [],
  challenge_results: [],
  news: SEED_NEWS.map((n, i) => ({ id: 'n' + i, ...n })),
  suggestions: [],
  push_subscriptions: [],
  photos: [],
  photo_likes: [],
  files: {}, // alleen zonder Supabase: foto's als data-URL in het geheugen
});
if (!mem.photos) Object.assign(mem, { photos: [], photo_likes: [], files: {} });
if (!mem.strava_links) Object.assign(mem, { strava_links: [], strava_efforts: [] });

// ---- foto-opslag (bucket 'photos') ----
export async function putFile(path, buffer, contentType) {
  if (sb) {
    const { error } = await sb.storage.from('photos').upload(path, buffer, { contentType, upsert: false, cacheControl: '31536000' });
    if (error) throw new Error(error.message);
    return;
  }
  mem.files[path] = `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`;
}

export function fileUrl(path) {
  if (sb) return sb.storage.from('photos').getPublicUrl(path).data.publicUrl;
  return mem.files[path] || '';
}

export async function deleteFile(path) {
  if (sb) { await sb.storage.from('photos').remove([path]); return; }
  delete mem.files[path];
}

const uid = () => (globalThis.crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));
const matches = (row, match) => Object.entries(match).every(([k, v]) => row[k] === v);

export async function all(table) {
  if (sb) {
    const { data, error } = await sb.from(table).select('*');
    if (error) throw new Error(error.message);
    return data;
  }
  return mem[table].map((r) => ({ ...r }));
}

export async function insert(table, row) {
  if (sb) {
    const { data, error } = await sb.from(table).insert(row).select().single();
    if (error) throw new Error(error.message);
    return data;
  }
  const r = { id: row.id || uid(), created_at: new Date().toISOString(), ...row };
  mem[table].push(r);
  return r;
}

export async function upsert(table, row, conflictKeys) {
  if (sb) {
    const { error } = await sb.from(table).upsert(row, { onConflict: conflictKeys.join(',') });
    if (error) throw new Error(error.message);
    return row;
  }
  const match = Object.fromEntries(conflictKeys.map((k) => [k, row[k]]));
  const i = mem[table].findIndex((r) => matches(r, match));
  if (i >= 0) mem[table][i] = { ...mem[table][i], ...row };
  else mem[table].push({ created_at: new Date().toISOString(), ...row });
  return row;
}

export async function remove(table, match) {
  if (sb) {
    let q = sb.from(table).delete();
    for (const [k, v] of Object.entries(match)) q = q.eq(k, v);
    const { error } = await q;
    if (error) throw new Error(error.message);
    return;
  }
  mem[table] = mem[table].filter((r) => !matches(r, match));
  if (table === 'rides' && match.id) mem.ride_passengers = mem.ride_passengers.filter((p) => p.ride_id !== match.id);
}
