// "Samen": wat we als club samen doen. Niet wie het snelst of verst liep, maar wie er was.
// Clubcijfers komen uit de app zelf ("ik ben erbij", aanmeldingen, carpool, foto's, nieuwe leden).
// Strava-gegevens tonen we alleen aan het lid zelf (Strava API-regels), dus nooit in de clubcijfers.
import { all } from './db';
import { todayISO } from './club';
import { linkFor, freshToken, get } from './strava';

export const MONTH_GOAL = 250;           // samen-doel per maand: keren dat iemand erbij was
export const GREBBEBERG_M = 50;          // hoogte Grebbeberg boven de Rijn, ongeveer
const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

const dateOf = (id, byId) => byId[id]?.date || (/^training-(\d{4}-\d{2}-\d{2})$/.exec(id) || [])[1] || null;

export async function clubTogether(today = todayISO()) {
  const [events, participants, profiles, rides, photos] = await Promise.all([
    all('events'), all('participants'), all('profiles').catch(() => []), all('rides').catch(() => []), all('photos').catch(() => []),
  ]);
  const month = today.slice(0, 7);
  const byId = Object.fromEntries(events.map((e) => [e.id, e]));

  // per afgelopen moment deze maand: hoeveel mensen er waren
  const perMoment = {};
  for (const p of participants) {
    const d = dateOf(p.event_id, byId);
    if (!d || d.slice(0, 7) !== month || d > today) continue;
    (perMoment[p.event_id] ||= { id: p.event_id, date: d, n: 0 }).n++;
  }
  const moments = Object.values(perMoment);
  const trainings = moments.filter((m) => m.id.startsWith('training-'));
  const busiest = trainings.sort((a, b) => b.n - a.n)[0] || null;

  // eerstvolgende dinsdag: wie komt er al?
  const nextTraining = participants
    .map((p) => ({ p, d: dateOf(p.event_id, byId) }))
    .filter(({ p, d }) => p.event_id.startsWith('training-') && d >= today)
    .sort((a, b) => a.d.localeCompare(b.d));
  const nextDate = nextTraining[0]?.d || null;

  const inMonth = (ts) => String(ts || '').slice(0, 7) === month;
  return {
    monthName: MONTHS[Number(month.slice(5)) - 1],
    goal: MONTH_GOAL,
    together: moments.reduce((n, m) => n + m.n, 0),
    moments: moments.length,
    trainings: trainings.length,
    busiest: busiest ? { date: busiest.date, n: busiest.n } : null,
    next: nextDate ? { date: nextDate, n: nextTraining.filter((x) => x.d === nextDate).length } : null,
    members: profiles.length,
    newMembers: profiles.filter((p) => inMonth(p.created_at)).length,
    rides: rides.filter((r) => String(dateOf(r.event_id, byId) || '').slice(0, 7) === month).length,
    photos: photos.filter((p) => inMonth(p.created_at)).length,
  };
}

// --- Persoonlijk, alleen voor het lid zelf ---

const cache = new Map(); // device → { at, data }
const CACHE_MS = 10 * 60e3;

// maandag van de week (Europe/Amsterdam is goed genoeg op datumniveau)
function weekStart(iso) {
  const d = new Date(iso.slice(0, 10) + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

export async function myTogether(device, today = todayISO()) {
  const hit = cache.get(device);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.data;
  const link = await linkFor(device);
  if (!link) return { connected: false };

  const token = await freshToken(link);
  const after = Math.floor(Date.now() / 1000) - 12 * 7 * 86400; // 12 weken terug, genoeg voor de reeks
  const acts = [];
  for (let page = 1; page <= 3; page++) {
    const batch = await get(token, `/athlete/activities?after=${after}&per_page=100&page=${page}`);
    acts.push(...batch);
    if (batch.length < 100) break;
  }
  const runs = acts
    .filter((a) => /Run/.test(a.sport_type || a.type))
    .map((a) => ({ date: String(a.start_date_local).slice(0, 10), hour: Number(String(a.start_date_local).slice(11, 13)), km: (a.distance || 0) / 1000, up: a.total_elevation_gain || 0, group: (a.athlete_count || 1) > 1 }));

  const thisWeek = weekStart(today);
  const lastWeekD = new Date(thisWeek + 'T12:00:00Z'); lastWeekD.setUTCDate(lastWeekD.getUTCDate() - 7);
  const lastWeek = lastWeekD.toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const sum = (list, f) => list.reduce((n, r) => n + f(r), 0);

  const wk = runs.filter((r) => weekStart(r.date) === thisWeek);
  const prev = runs.filter((r) => weekStart(r.date) === lastWeek);
  const mo = runs.filter((r) => r.date.slice(0, 7) === month);

  // reeks: aaneengesloten weken met minstens één loopje (deze week telt mee zodra je gelopen hebt)
  const weeks = new Set(runs.map((r) => weekStart(r.date)));
  let streak = 0;
  const w = new Date((weeks.has(thisWeek) ? thisWeek : lastWeek) + 'T12:00:00Z');
  while (weeks.has(w.toISOString().slice(0, 10))) { streak++; w.setUTCDate(w.getUTCDate() - 7); }

  const data = {
    connected: true,
    firstname: link.firstname || '',
    week: { runs: wk.length, km: Math.round(sum(wk, (r) => r.km) * 10) / 10 },
    lastWeek: { runs: prev.length, km: Math.round(sum(prev, (r) => r.km) * 10) / 10 },
    streak,
    month: {
      runs: mo.length,
      km: Math.round(sum(mo, (r) => r.km)),
      grebbeberg: Math.round(sum(mo, (r) => r.up) / GREBBEBERG_M),
      early: mo.filter((r) => r.hour < 7).length,
      late: mo.filter((r) => r.hour >= 21).length,
      group: mo.filter((r) => r.group).length,
    },
  };
  cache.set(device, { at: Date.now(), data });
  return data;
}
