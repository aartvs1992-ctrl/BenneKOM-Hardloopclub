// BenneKOM badges: de catalogus en de berekening. Werkt in de app én op de server (geen database hier).
// Een badge verdien je met een bevestigde aanwezigheid (via Strava of inchecken), niet met alleen "ik ben erbij".
import { CLUB, trainingKind } from './club';

export const TIERS = {
  brons: { name: 'Gewoon', c1: '#EDBB90', c2: '#9A5F37' },
  zilver: { name: 'Zeldzaam', c1: '#DCEBF0', c2: '#7E9EAD' },
  episch: { name: 'Episch', c1: '#CDA8FF', c2: '#6A3BB5' },
  legend: { name: 'Legendarisch', c1: '#FFE38C', c2: '#C98C14' },
};
export const TIER_ORDER = ['legend', 'episch', 'zilver', 'brons'];

export const CATEGORIES = [
  ['dinsdag', 'Dinsdagstempels', 'Elke clubtraining op dinsdag telt.'],
  ['reeks', 'Training & reeksen', 'Voor wie blijft komen, ook in de kou.'],
  ['5k', '5km Challenge', 'Racen tegen je eigen tijd.'],
  ['events', 'Events', 'Eén datum, één badge. Daarna gaat hij op slot.'],
];

// shape: medal | hex | diamond | shield. need = aantal voor de voortgangsbalk.
export const BADGES = [
  { id: 'eerste-dinsdag', name: 'Eerste Dinsdag', cat: 'dinsdag', tier: 'brons', shape: 'medal', num: '1', tag: 'DINSDAG', need: 1, crit: 'Je eerste clubtraining op dinsdag.' },
  { id: 'vaste-prik', name: 'Vaste Prik', cat: 'dinsdag', tier: 'brons', shape: 'medal', num: '10', tag: 'DINSDAG', need: 10, crit: '10 dinsdagtrainingen gelopen.' },
  { id: 'dinsdagdier', name: 'Dinsdagdier', cat: 'dinsdag', tier: 'zilver', shape: 'medal', num: '25', tag: 'DINSDAG', need: 25, crit: '25 dinsdagtrainingen gelopen.' },
  { id: 'clubicoon', name: 'Clubicoon', cat: 'dinsdag', tier: 'episch', shape: 'medal', num: '50', tag: 'DINSDAG', need: 50, crit: '50 dinsdagtrainingen gelopen.' },
  { id: 'legende', name: 'BenneKOM Legende', cat: 'dinsdag', tier: 'legend', shape: 'medal', num: '100', tag: 'DINSDAG', need: 100, crit: '100 dinsdagtrainingen. Hall of fame.' },

  { id: 'intervaltijger', name: 'Intervaltijger', cat: 'reeks', tier: 'brons', shape: 'hex', icon: 'bolt', tag: 'INTERVAL', need: 10, crit: '10 intervaltrainingen op dinsdag.' },
  { id: 'duurmotor', name: 'Duurmotor', cat: 'reeks', tier: 'brons', shape: 'hex', icon: 'wave', tag: 'DUURLOOP', need: 10, crit: '10 duurlopen op dinsdag.' },
  { id: 'ijzeren-reeks', name: 'IJzeren Reeks', cat: 'reeks', tier: 'zilver', shape: 'hex', icon: 'flame', tag: '8 OP RIJ', need: 8, crit: '8 dinsdagtrainingen op rij, geen enkele gemist.' },
  { id: 'winterhard', name: 'Winterhard', cat: 'reeks', tier: 'zilver', shape: 'hex', icon: 'snow', tag: 'WINTER', need: 10, crit: '10 dinsdagtrainingen in december, januari of februari.' },
  { id: 'jaarrond', name: 'Jaarrond', cat: 'reeks', tier: 'episch', shape: 'hex', icon: 'star', tag: '12 MND', need: 12, crit: '12 maanden op rij minstens één clubtraining.' },

  { id: 'eerste-5k', name: 'Eerste 5K', cat: '5k', tier: 'brons', shape: 'diamond', icon: 'stopwatch', tag: '5K', need: 1, crit: 'Je eerste 5km Challenge gelopen.' },
  { id: 'pr-jager', name: 'PR-Jager', cat: '5k', tier: 'zilver', shape: 'diamond', icon: 'mountain', tag: 'PR', crit: 'Sneller dan al je vorige Challenges.' },
  { id: 'haas', name: 'Haas', cat: '5k', tier: 'zilver', shape: 'diamond', icon: 'flag', tag: 'HAAS', crit: 'Een ander naar een mooie tijd gebracht. Toegekend door de club.' },
  { id: 'alle-12', name: 'Alle 12', cat: '5k', tier: 'legend', shape: 'diamond', icon: 'crown', tag: '12/12', need: 12, crit: 'Alle twaalf Challenges van een jaar gelopen.' },

  { id: 'backyard-2026', name: 'Backyard Run 2026', cat: 'events', tier: 'legend', shape: 'shield', icon: 'loop', tag: '2026', crit: 'Meegelopen op het 1-jarig jubileum, 31 oktober 2026.' },
  { id: 'carbo-loader', name: 'Carbo Loader', cat: 'events', tier: 'episch', shape: 'shield', icon: 'pasta', tag: 'PASTA RUN', crit: 'Run Pasta Run, 17 november 2026. Eerst lopen, dan eten.' },
  { id: 'ijsbeer', name: 'IJsbeer', cat: 'events', tier: 'episch', shape: 'shield', icon: 'drop', tag: 'DIP 2026', crit: 'Run-Dip-Run, 19 december 2026. Rennen, Rijn in, terugrennen.' },
  { id: 'founding-member', name: 'Founding Member', cat: 'events', tier: 'legend', shape: 'shield', icon: 'star', tag: 'EST. 2025', crit: 'Erbij in het eerste jaar, 2025.' },
];
export const BADGE = Object.fromEntries(BADGES.map((b) => [b.id, b]));
// Badges die alleen Beheer kan toekennen (Strava kan dit niet zien)
export const MANUAL_ONLY = ['haas'];

// Events met een eigen badge. Telt via Strava (loopje op die dag, in dat tijdvak, in de buurt van Bennekom)
// of via inchecken bij het event in de app (eventIds). Nieuw event met badge? Voeg hem hier en in BADGES toe.
export const BADGE_EVENTS = [
  { key: 'backyard-2026', date: '2026-10-31', from: '07:00', to: '21:00', eventIds: [], badges: ['backyard-2026'] },
  { key: 'pasta-run', date: '2026-11-17', from: '17:15', to: '19:45', eventIds: ['pasta-run'], badges: ['carbo-loader'] },
  { key: 'run-dip-run', date: '2026-12-19', from: '06:00', to: '21:00', eventIds: ['run-dip-run'], badges: ['ijsbeer'] },
];

export const CLUB_START = '2025-07-01'; // vanaf hier zoekt de app naar clubtrainingen
// De eerste weken liep de club op donderdag; vanaf 12 augustus 2025 op dinsdag
export const EARLY_DAYS = { until: '2025-08-11', day: 4 };

const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const weekday = (iso) => new Date(iso + 'T12:00:00Z').getUTCDay();
const lastSaturday = (iso) => weekday(iso) === 6 && addDays(iso, 7).slice(0, 7) !== iso.slice(0, 7);

// Is dit een clubtrainingsdag? (eerst donderdag, nu dinsdag)
export const isClubDay = (iso) => iso >= CLUB_START && weekday(iso) === (iso <= EARLY_DAYS.until ? EARLY_DAYS.day : CLUB.trainingDay);

// Alle dagen met een clubtraining, van de start van de club t/m `today`
export function trainingDates(today) {
  const out = [];
  for (let d = CLUB_START; d <= today; d = addDays(d, 1)) if (isClubDay(d)) out.push(d);
  return out;
}
// Interval of duurloop. Vóór het wisselschema (intervalFrom) was elke dinsdag een duurloop.
export const kindOf = (iso) => (iso < CLUB.intervalFrom ? 'duurloop' : trainingKind(iso));

/**
 * Bereken alle badges voor één lid.
 * log: [{ key, date, source }]  — key 'training-JJJJ-MM-DD', 'event:<key>' of 'award:<badgeId>'
 * challenges: [{ date: 'JJJJ-MM-DD', seconds }] — 5km Challenge-tijden (Strava + zelf ingevuld)
 * memberSince: 'JJJJ-MM' uit het profiel (optioneel)
 */
export function computeBadges({ log = [], challenges = [], memberSince = '', today }) {
  const trainings = [...new Set(log.filter((l) => l.key.startsWith('training-')).map((l) => l.key.slice(9)))].sort();
  const firstSource = {};
  for (const l of log) if (!firstSource[l.key] || l.source === 'strava') firstSource[l.key] = l.source;
  const events = Object.fromEntries(log.filter((l) => l.key.startsWith('event:')).map((l) => [l.key.slice(6), l.date]));
  const awards = Object.fromEntries(log.filter((l) => l.key.startsWith('award:')).map((l) => [l.key.slice(6), l.date]));
  const res = {};
  const set = (id, date, have) => { res[id] = { earned: Boolean(date), date: date || null, have: have ?? null }; };
  const nth = (list, n) => (list.length >= n ? list[n - 1] : null);

  // Dinsdagstempels
  for (const b of BADGES.filter((x) => x.cat === 'dinsdag')) set(b.id, nth(trainings, b.need), Math.min(trainings.length, b.need));

  // Interval / duur
  const intervals = trainings.filter((d) => kindOf(d) === 'interval');
  const duur = trainings.filter((d) => kindOf(d) === 'duurloop');
  set('intervaltijger', nth(intervals, 10), Math.min(intervals.length, 10));
  set('duurmotor', nth(duur, 10), Math.min(duur.length, 10));

  // Reeks: opeenvolgende clubdinsdagen
  const all = trainingDates(today);
  const went = new Set(trainings);
  let run = 0, best = 0, streakDate = null;
  for (const d of all) {
    if (went.has(d)) { run++; if (run > best) best = run; if (run === 8 && !streakDate) streakDate = d; }
    else if (d < today) run = 0; // vandaag nog niet geweest breekt de reeks niet
  }
  set('ijzeren-reeks', streakDate, Math.min(streakDate ? 8 : run, 8));

  const winter = trainings.filter((d) => ['12', '01', '02'].includes(d.slice(5, 7)));
  set('winterhard', nth(winter, 10), Math.min(winter.length, 10));

  // Jaarrond: 12 maanden op rij
  const months = [...new Set(trainings.map((d) => d.slice(0, 7)))].sort();
  let mRun = 0, mBest = 0, yearDate = null, prev = null;
  for (const m of months) {
    const next = prev && addDays(prev + '-15', 31).slice(0, 7);
    mRun = prev && next === m ? mRun + 1 : 1;
    if (mRun > mBest) mBest = mRun;
    if (mRun === 12 && !yearDate) yearDate = trainings.find((d) => d.startsWith(m));
    prev = m;
  }
  const thisMonth = today.slice(0, 7);
  const curMonths = months.length && (months[months.length - 1] === thisMonth || addDays(months[months.length - 1] + '-15', 31).slice(0, 7) === thisMonth) ? mRun : 0;
  set('jaarrond', yearDate, Math.min(yearDate ? 12 : curMonths, 12));

  // 5km Challenge: per maand je beste tijd
  const perMonth = {};
  for (const c of challenges) {
    const m = c.date.slice(0, 7);
    if (!perMonth[m] || c.seconds < perMonth[m].seconds) perMonth[m] = c;
  }
  const editions = Object.values(perMonth).sort((a, b) => a.date.localeCompare(b.date));
  set('eerste-5k', editions[0]?.date || null, Math.min(editions.length, 1));
  let fastest = Infinity, prDate = null;
  editions.forEach((e, i) => { if (i > 0 && e.seconds < fastest && !prDate) prDate = e.date; fastest = Math.min(fastest, e.seconds); });
  set('pr-jager', prDate);
  const byYear = {};
  for (const e of editions) (byYear[e.date.slice(0, 4)] ||= []).push(e.date);
  const fullYear = Object.values(byYear).find((l) => l.length >= 12);
  set('alle-12', fullYear ? fullYear[11] : null, Math.min((byYear[today.slice(0, 4)] || []).length, 12));

  // Events
  for (const ev of BADGE_EVENTS) for (const id of ev.badges) set(id, events[ev.key] || null);
  const first2025 = trainings.find((d) => d < '2026-01-01');
  set('founding-member', first2025 || (/^2025-/.test(memberSince || '') ? memberSince + '-01' : null));

  // Handmatig toegekend door Beheer gaat altijd voor
  for (const [id, date] of Object.entries(awards)) if (BADGE[id]) res[id] = { ...res[id], earned: true, date: res[id]?.date || date, have: res[id]?.have ?? null };
  set('haas', awards.haas || null);

  return BADGES.map((b) => ({ ...b, ...(res[b.id] || { earned: false, date: null, have: null }) }));
}

// Laatste 10 clubdinsdagen voor de reeks-weergave
export function recentTuesdays(log, today, n = 10) {
  const went = new Set(log.filter((l) => l.key.startsWith('training-')).map((l) => l.key.slice(9)));
  return trainingDates(today).slice(-n).map((d) => ({ date: d, went: went.has(d), kind: kindOf(d) }));
}

// Volgende badge om naartoe te werken: die met de meeste voortgang
export function nextBadge(list) {
  return list
    .filter((b) => !b.earned && b.need > 1 && b.have != null)
    .sort((a, b) => b.have / b.need - a.have / a.need || a.need - b.need)[0] || null;
}

export const isLastSaturday = lastSaturday;
