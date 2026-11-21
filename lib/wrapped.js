// BenneKOM Wrapped: persoonlijk jaaroverzicht van één lid, alleen met de eigen gegevens.
// Bronnen: badge_log (trainingen, events, samen lopen; via Strava of inchecken), aanmeldingen,
// 5km Challenge-tijden en, voor wie Strava heeft, de snelste kilometer op een intervaldinsdag.
import { all, find, upsert } from './db';
import { todayISO } from './club';
import { BADGE, BADGE_EVENTS, trainingDates, kindOf } from './badges';
import { badgeState } from './badgeScan';
import { linkFor, freshToken, get, stravaReady } from './strava';

import { WRAPPED } from './content';
export { WRAPPED };

const tz = (iso) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam' }).format(new Date(iso));

// Snelste kilometer op een intervaldinsdag: uit de 'best efforts' van Strava. Eén keer berekend en bewaard.
async function fastestKm(device, year, dates, log) {
  const key = `meta:wrapped-${year}-km`;
  const saved = log.find((r) => r.key === key);
  if (saved) return saved.distance ? { seconds: saved.distance, date: saved.date } : null;
  if (!stravaReady) return null;
  const link = await linkFor(device).catch(() => null);
  if (!link) return null;
  const token = await freshToken(link);
  const after = Math.floor(new Date(`${year}-01-01T00:00:00Z`).getTime() / 1000);
  const before = Math.floor(new Date(`${year + 1}-01-01T00:00:00Z`).getTime() / 1000);
  const intervalDays = new Set(dates.filter((d) => kindOf(d) === 'interval'));
  const runs = [];
  for (let page = 1; page <= 3; page++) {
    const batch = await get(token, `/athlete/activities?after=${after}&before=${before}&per_page=200&page=${page}`);
    for (const a of batch) {
      const local = String(a.start_date_local || '');
      if (!/run/i.test(a.sport_type || a.type || '') || !intervalDays.has(local.slice(0, 10))) continue;
      const hm = local.slice(11, 16);
      if (hm >= '17:00' && hm <= '21:30') runs.push(a);
    }
    if (batch.length < 200) break;
  }
  // de vier snelste intervalavonden bekijken (zuinig met Strava-verzoeken)
  runs.sort((a, b) => (b.average_speed || 0) - (a.average_speed || 0));
  let best = null;
  for (const a of runs.slice(0, 4)) {
    const full = await get(token, `/activities/${a.id}`);
    const k = (full.best_efforts || []).find((e) => /^1\s?k$/i.test(e.name || ''));
    if (k && (!best || k.elapsed_time < best.seconds)) best = { seconds: k.elapsed_time, date: String(a.start_date_local).slice(0, 10) };
  }
  await upsert('badge_log', { device_id: device, key, date: best?.date || todayISO(), source: 'meta', activity_id: null, distance: best?.seconds || 0 }, ['device_id', 'key']).catch(() => {});
  return best;
}

export async function wrapped(device, year = WRAPPED.year) {
  const today = todayISO();
  const end = `${year}-12-31` < today ? `${year}-12-31` : today;
  const inYear = (d) => String(d || '').startsWith(String(year));
  const [log, profiles, parts, efforts, manual, st] = await Promise.all([
    find('badge_log', { device_id: device }).catch(() => []),
    all('profiles').catch(() => []),
    all('participants').catch(() => []),
    find('strava_efforts', { device_id: device }).catch(() => []),
    find('challenge_results', { device_id: device }).catch(() => []),
    badgeState(device).catch(() => null),
  ]);
  const me = profiles.find((p) => p.device_id === device);

  // Dinsdagen
  const held = trainingDates(end).filter(inYear);
  const allTrainings = log.filter((r) => r.key.startsWith('training-')).sort((a, b) => a.key.localeCompare(b.key));
  const rows = allTrainings.filter((r) => inYear(r.key.slice(9)));
  const went = new Set(rows.map((r) => r.key.slice(9)));
  let streak = 0, run = 0;
  for (const d of held) { run = went.has(d) ? run + 1 : 0; streak = Math.max(streak, run); }
  const dates = [...went].sort();
  const km = Math.round(rows.reduce((s, r) => s + (r.distance || 0), 0) / 1000);
  const intervals = dates.filter((d) => kindOf(d) === 'interval').length;
  // Drukste dinsdag waar je bij was: het meeste aantal aanmeldingen
  const perTraining = {};
  for (const p of parts) if (p.event_id?.startsWith('training-')) perTraining[p.event_id] = (perTraining[p.event_id] || 0) + 1;
  let busiest = null;
  for (const d of dates) { const n = perTraining['training-' + d] || 0; if (n && (!busiest || n > busiest.n)) busiest = { n, date: d }; }

  // 5km Challenge: segmenttijden van Strava en zelf ingevulde tijden
  const times = [
    ...efforts.map((e) => ({ date: tz(e.start_date), seconds: e.elapsed_time })),
    ...manual.map((m) => ({ date: String(m.created_at || '').slice(0, 10), seconds: m.seconds })),
  ].filter((t) => inYear(t.date) && t.seconds > 600).sort((a, b) => a.date.localeCompare(b.date));
  const perDay = {};
  for (const t of times) if (!perDay[t.date] || t.seconds < perDay[t.date]) perDay[t.date] = t.seconds;
  const days = Object.keys(perDay).sort();
  const challenge = days.length ? {
    count: days.length,
    first: { date: days[0], seconds: perDay[days[0]] },
    best: days.reduce((b, d) => (perDay[d] < b.seconds ? { date: d, seconds: perDay[d] } : b), { date: days[0], seconds: perDay[days[0]] }),
  } : null;

  // Samen lopen en specials
  const samenOrg = log.filter((r) => r.key.startsWith('samenorg:') && inYear(r.date)).length;
  const samenJoin = log.filter((r) => r.key.startsWith('samen:') && inYear(r.date)).length;
  const specials = BADGE_EVENTS.filter((e) => inYear(e.date) && log.some((r) => r.key === 'event:' + e.key))
    .map((e) => ({ date: e.date, name: BADGE[e.badges[0]]?.name || e.key, distance: log.find((r) => r.key === 'event:' + e.key)?.distance || 0 }));

  // Badges van dit jaar
  const earned = (st?.badges || []).filter((b) => b.earned && inYear(b.date));
  const tierRank = { legend: 0, episch: 1, zilver: 2, brons: 3 };
  const topBadges = [...earned].sort((a, b) => (tierRank[a.tier] ?? 4) - (tierRank[b.tier] ?? 4)).slice(0, 3)
    .map((b) => ({ id: b.id, name: b.name, tier: b.tier, shape: b.shape, icon: b.icon, num: b.num, tag: b.tag }));

  let fastest = null;
  try { fastest = await fastestKm(device, year, dates, log); } catch { /* Strava even niet bereikbaar: kaart valt weg */ }

  // De club als geheel (voor iedereen hetzelfde)
  const clubSignups = parts.filter((p) => p.event_id?.startsWith(`training-${year}`)).length;
  const clubMax = Math.max(0, ...Object.entries(perTraining).filter(([k]) => k.startsWith(`training-${year}`)).map(([, n]) => n));

  return {
    year,
    name: me?.first_name || '',
    since: allTrainings[0]?.key.slice(9) || null,
    strava: Boolean(st?.connected),
    tuesdays: { count: dates.length, held: held.length, km, hours: Math.round((dates.length * WRAPPED.minutesPerTraining) / 60), streak, intervals, duurlopen: dates.length - intervals, first: dates[0] || null, busiest },
    fastest,
    challenge,
    samen: { org: samenOrg, join: samenJoin },
    specials,
    badges: { count: earned.length, top: topBadges },
    club: { members: profiles.length, trainings: held.length, signups: clubSignups, maxGroup: clubMax },
  };
}

// Voorbeeld voor ?demo: een verzonnen lid
export const DEMO = {
  year: 2026, name: 'Sanne', since: '2026-04-14', strava: true, demo: true,
  tuesdays: { count: 22, held: 49, km: 176, hours: 28, streak: 6, intervals: 10, duurlopen: 12, first: '2026-04-14', busiest: { n: 41, date: '2026-09-08' } },
  fastest: { seconds: 278, date: '2026-09-08' },
  challenge: { count: 4, first: { date: '2026-05-30', seconds: 1872 }, best: { date: '2026-09-26', seconds: 1668 } },
  samen: { org: 0, join: 3 },
  specials: [{ date: '2026-10-31', name: 'Backyard Run 2026', distance: 20100 }, { date: '2026-11-17', name: 'Carbo Loader', distance: 8000 }],
  badges: { count: 8, top: [] },
  club: { members: 102, trainings: 49, signups: 1240, maxGroup: 41 },
};
