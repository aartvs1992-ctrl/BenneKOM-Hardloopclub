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
  ['diehard', 'Diehard', 'Alleen voor wie heel vaak komt.'],
];

// shape: medal | hex | diamond | shield. need = aantal voor de voortgangsbalk.
export const BADGES = [
  { id: 'eerste-dinsdag', name: 'Eerste Dinsdag', cat: 'dinsdag', tier: 'brons', shape: 'medal', num: '1', tag: 'DINSDAG', need: 1, crit: 'Aangesloten bij BenneKOM en je eerste dinsdag met clubgenoten gelopen.' },
  { id: 'vaste-prik', name: 'Vaste Prik', cat: 'dinsdag', tier: 'brons', shape: 'medal', num: '10', tag: 'DINSDAG', need: 10, crit: '10 dinsdagtrainingen gelopen.' },
  { id: 'dinsdagdier', name: 'Dinsdagdier', cat: 'dinsdag', tier: 'zilver', shape: 'medal', num: '25', tag: 'DINSDAG', need: 25, crit: '25 dinsdagtrainingen gelopen.' },
  { id: 'clubicoon', name: 'Clubicoon', cat: 'dinsdag', tier: 'episch', shape: 'medal', num: '50', tag: 'DINSDAG', need: 50, crit: '50 dinsdagtrainingen gelopen.' },
  { id: 'legende', name: 'BenneKOM Legende', cat: 'dinsdag', tier: 'legend', shape: 'medal', num: '100', tag: 'DINSDAG', need: 100, crit: '100 dinsdagtrainingen. Hall of fame.' },
  { id: 'mythe', name: 'BenneKOM Mythe', cat: 'dinsdag', tier: 'legend', shape: 'medal', num: '200', tag: 'DINSDAG', need: 200, crit: '200 dinsdagtrainingen. Daar wordt over verteld.' },

  { id: 'intervaltijger', name: 'Intervaltijger', cat: 'reeks', tier: 'brons', shape: 'hex', icon: 'bolt', tag: 'INTERVAL', need: 10, crit: '10 intervaltrainingen op dinsdag.' },
  { id: 'ijzeren-reeks', name: 'IJzeren Reeks', cat: 'reeks', tier: 'zilver', shape: 'hex', icon: 'flame', tag: '8 OP RIJ', need: 8, crit: '8 dinsdagtrainingen op rij, geen enkele gemist.' },
  { id: 'winterhard', name: 'Winterhard', cat: 'reeks', tier: 'zilver', shape: 'hex', icon: 'snow', tag: 'WINTER', need: 10, crit: '10 dinsdagtrainingen in december, januari of februari.' },
  { id: 'jaarrond', name: 'Jaarrond', cat: 'reeks', tier: 'episch', shape: 'hex', icon: 'star', tag: '12 MND', need: 12, crit: '12 maanden op rij minstens één clubtraining.' },

  { id: 'eerste-5k', name: 'Eerste 5K', cat: '5k', tier: 'brons', shape: 'diamond', icon: 'stopwatch', tag: '5K', need: 1, crit: 'Je eerste 5km Challenge gelopen.' },
  { id: 'zes-5k', name: 'Vaste Challenger', cat: '5k', tier: 'zilver', shape: 'diamond', icon: 'flag', tag: '6 × 5K', need: 6, crit: 'Bij 6 Challenges aanwezig geweest.' },
  { id: 'pr-jager', name: 'PR-Jager', cat: '5k', tier: 'zilver', shape: 'diamond', icon: 'mountain', tag: 'PR', crit: 'Op een Challenge sneller dan al je vorige Challenges.' },
  { id: 'haas', name: 'Haas', cat: '5k', tier: 'zilver', shape: 'diamond', icon: 'heart', tag: 'HAAS', crit: 'Een ander naar een mooie tijd gebracht. Toegekend door de club.' },
  { id: 'alle-12', name: 'Challenge-Koning', cat: '5k', tier: 'legend', shape: 'diamond', icon: 'crown', tag: '12 × 5K', need: 12, crit: 'Bij 12 Challenges aanwezig geweest.' },

  // Diehard: zwaar te halen, met een eigen vorm (rozet)
  { id: 'onbreekbaar', name: 'Onbreekbaar', cat: 'diehard', tier: 'legend', shape: 'burst', icon: 'chain', tag: '25 OP RIJ', need: 25, crit: '25 dinsdagen op rij met de club gelopen. Een half jaar lang elke week.' },
  { id: 'volle-jaargang', name: 'Volle Jaargang', cat: 'diehard', tier: 'episch', shape: 'burst', icon: 'calendar', tag: '40 / JAAR', need: 40, crit: '40 dinsdagen in één kalenderjaar.' },
  { id: 'ijstijd', name: 'IJstijd', cat: 'diehard', tier: 'episch', shape: 'burst', icon: 'snow', tag: 'DEC–FEB', need: 13, crit: 'In één winter alle dinsdagen van december tot en met februari gelopen.' },
  { id: 'km-500', name: '500 Clubkilometers', cat: 'diehard', tier: 'zilver', shape: 'burst', icon: 'road', tag: '500 KM', need: 500, unit: 'km', crit: '500 kilometer gelopen op clubdinsdagen.' },
  { id: 'km-1000', name: '1000 Clubkilometers', cat: 'diehard', tier: 'legend', shape: 'burst', icon: 'road', tag: '1000 KM', need: 1000, unit: 'km', crit: '1000 kilometer gelopen op clubdinsdagen.' },
  { id: 'challenge-reeks', name: 'Challenge-Reeks', cat: 'diehard', tier: 'episch', shape: 'burst', icon: 'repeat', tag: '6 OP RIJ', need: 6, crit: '6 Challenges op rij aanwezig. Een maand zonder Challenge breekt de reeks niet.' },
  { id: 'pr-machine', name: 'PR-Machine', cat: 'diehard', tier: 'legend', shape: 'burst', icon: 'rocket', tag: '3 PR', need: 3, crit: 'Op 3 verschillende Challenges een nieuw PR gelopen.' },
  { id: 'volle-week', name: 'Volle Week', cat: 'diehard', tier: 'zilver', shape: 'burst', icon: 'week', tag: '5 WEKEN', need: 5, crit: '5 keer op dinsdag getraind én dezelfde week de Challenge gelopen.' },

  { id: 'backyard-2026', name: 'Backyard Run 2026', cat: 'events', tier: 'legend', shape: 'shield', icon: 'loop', tag: '2026', crit: 'Meegelopen op het 1-jarig jubileum, 31 oktober 2026.' },
  { id: 'carbo-loader', name: 'Carbo Loader', cat: 'events', tier: 'episch', shape: 'shield', icon: 'pasta', tag: 'PASTA RUN', crit: 'Run Pasta Run, 17 november 2026. Eerst lopen, dan eten.' },
  { id: 'ijsbeer', name: 'IJsbeer', cat: 'events', tier: 'episch', shape: 'shield', icon: 'drop', tag: 'DIP 2026', crit: 'Run-Dip-Run, 19 december 2026. Rennen, Rijn in, terugrennen.' },
  // secret: wie hem niet heeft, ziet hem niet (hij is niet meer te halen)
  { id: 'founding-member', name: 'Van het Eerste Uur', cat: 'events', tier: 'legend', shape: 'shield', icon: 'star', tag: 'EST. 2025', secret: true, crit: 'Liep al met de club vóór september 2025. Deze krijgt niemand meer.' },
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
// Dinsdagen zonder clubtraining (bijv. kerst). Die breken geen reeks en tellen niet mee voor IJstijd.
export const NO_TRAINING = [];
// 5km Challenges die zijn doorgegaan (vóór ze als event in de app stonden). Leeg = alleen de Challenges uit de app
// en die waar je zelf was; vul aan voor een eerlijke Challenge-Reeks.
export const PAST_CHALLENGES = ['2025-10-25', '2026-06-20', '2026-07-25', '2026-09-26', '2026-10-24'];
// Intervaltrainingen van vóór het vaste wisselschema (vanaf 10 november 2026 gaat het om de week vanzelf).
// Uit de Strava-beschrijvingen van de trainer. Mist er een? Zet de datum erbij.
export const INTERVAL_DATES = [
  '2025-09-30', '2025-10-14', '2025-11-04', '2025-11-18', '2025-12-02', '2025-12-16',
  '2026-01-13', '2026-01-27', '2026-02-10', '2026-02-24', '2026-04-14', '2026-04-28',
  '2026-05-12', '2026-06-30', '2026-07-14', '2026-08-25', '2026-09-08', '2026-10-20',
];

const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const weekday = (iso) => new Date(iso + 'T12:00:00Z').getUTCDay();
const lastSaturday = (iso) => weekday(iso) === 6 && addDays(iso, 7).slice(0, 7) !== iso.slice(0, 7);

// Is dit een clubtrainingsdag (dinsdag)?
export const isClubDay = (iso) => iso >= CLUB_START && weekday(iso) === CLUB.trainingDay;

// Alle dagen met een clubtraining, van de start van de club t/m `today`
export function trainingDates(today) {
  const out = [];
  for (let d = CLUB_START; d <= today; d = addDays(d, 1)) if (isClubDay(d) && !NO_TRAINING.includes(d)) out.push(d);
  return out;
}
// Interval of duurloop: vanaf intervalFrom om de week, daarvoor volgens INTERVAL_DATES.
export const kindOf = (iso) => (iso >= CLUB.intervalFrom ? trainingKind(iso) : INTERVAL_DATES.includes(iso) ? 'interval' : 'duurloop');

/**
 * Bereken alle badges voor één lid.
 * log: [{ key, date, source }]  — key 'training-JJJJ-MM-DD', 'event:<key>' of 'award:<badgeId>'
 * challenges: [{ date: 'JJJJ-MM-DD', seconds }] — 5km Challenge-tijden (Strava + zelf ingevuld)
 * memberSince: niet meer gebruikt (Van het Eerste Uur gaat op aanwezigheid)
 */
export function computeBadges({ log = [], challenges = [], challengeDays = [], memberSince = '', today }) {
  const trainings = [...new Set(log.filter((l) => l.key.startsWith('training-')).map((l) => l.key.slice(9)))].sort();
  const firstSource = {};
  for (const l of log) if (!firstSource[l.key] || l.source === 'strava') firstSource[l.key] = l.source;
  const events = Object.fromEntries(log.filter((l) => l.key.startsWith('event:')).map((l) => [l.key.slice(6), l.date]));
  const awards = Object.fromEntries(log.filter((l) => l.key.startsWith('award:')).map((l) => [l.key.slice(6), l.date]));
  const res = {};
  const set = (id, date, have, need) => { res[id] = { earned: Boolean(date), date: date || null, have: have ?? null, ...(need ? { need } : {}) }; };
  const nth = (list, n) => (list.length >= n ? list[n - 1] : null);

  // Dinsdagstempels
  for (const b of BADGES.filter((x) => x.cat === 'dinsdag')) set(b.id, nth(trainings, b.need), Math.min(trainings.length, b.need));

  // Interval / duur
  const intervals = trainings.filter((d) => kindOf(d) === 'interval');
  set('intervaltijger', nth(intervals, 10), Math.min(intervals.length, 10));

  // Reeks: opeenvolgende clubdinsdagen
  const all = trainingDates(today);
  const went = new Set(trainings);
  let run = 0, best = 0, streakDate = null;
  for (const d of all) {
    if (went.has(d)) { run++; if (run > best) best = run; if (run === 8 && !streakDate) streakDate = d; }
    else if (d < today) run = 0; // vandaag nog niet geweest breekt de reeks niet
  }
  set('ijzeren-reeks', streakDate, Math.min(streakDate ? 8 : run, 8));
  // Onbreekbaar: 25 op rij
  run = 0; let unbroken = null;
  for (const d of all) {
    if (went.has(d)) { run++; if (run === 25 && !unbroken) unbroken = d; }
    else if (d < today) run = 0;
  }
  set('onbreekbaar', unbroken, Math.min(unbroken ? 25 : run, 25));

  // Volle Jaargang: 40 in één kalenderjaar
  const perYear = {};
  for (const d of trainings) (perYear[d.slice(0, 4)] ||= []).push(d);
  const fullJaar = Object.values(perYear).find((l) => l.length >= 40);
  set('volle-jaargang', fullJaar ? fullJaar[39] : null, Math.min((perYear[today.slice(0, 4)] || []).length, 40));

  // IJstijd: een hele winter (dec t/m feb) geen dinsdag gemist
  const seasonOf = (d) => { const m = +d.slice(5, 7); return m === 12 ? +d.slice(0, 4) : m <= 2 ? +d.slice(0, 4) - 1 : null; };
  const seasons = {};
  for (const d of all) { const y = seasonOf(d); if (y != null) (seasons[y] ||= []).push(d); }
  let iceDate = null;
  for (const [y, days] of Object.entries(seasons)) {
    const over = today > `${+y + 1}-02-28`;
    if (over && days.length && days.every((d) => went.has(d)) && !iceDate) iceDate = days[days.length - 1];
  }
  const curSeason = seasonOf(today) ?? (+today.slice(5, 7) >= 3 ? +today.slice(0, 4) : null);
  const curDays = (seasons[curSeason] || []);
  const allCur = [];
  for (let d = `${curSeason}-12-01`; d <= `${curSeason + 1}-02-29`.replace('-02-29', '-02-28'); d = addDays(d, 1)) if (isClubDay(d) && !NO_TRAINING.includes(d)) allCur.push(d);
  set('ijstijd', iceDate, curDays.every((d) => went.has(d)) ? curDays.length : 0, iceDate ? null : allCur.length || 13);

  // Clubkilometers: afstand van alle clubdinsdagen
  const kmByKey = {};
  for (const l of log) if (l.key.startsWith('training-') && l.distance) kmByKey[l.key] = Math.max(kmByKey[l.key] || 0, l.distance / 1000);
  let kmSum = 0, km500 = null, km1000 = null;
  for (const d of trainings) {
    kmSum += kmByKey['training-' + d] || 0;
    if (kmSum >= 500 && !km500) km500 = d;
    if (kmSum >= 1000 && !km1000) km1000 = d;
  }
  set('km-500', km500, Math.min(Math.floor(kmSum), 500));
  set('km-1000', km1000, Math.min(Math.floor(kmSum), 1000));

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

  // 5km Challenge: alleen Challenges waar je echt was (in een groep op de Challenge-zaterdag over het segment)
  const chDates = [...new Set(log.filter((l) => l.key.startsWith('challenge-')).map((l) => l.key.slice(10)))].sort();
  set('eerste-5k', nth(chDates, 1), Math.min(chDates.length, 1));
  set('zes-5k', nth(chDates, 6), Math.min(chDates.length, 6));
  set('alle-12', nth(chDates, 12), Math.min(chDates.length, 12));
  // PR: per Challenge je beste tijd op het segment die dag
  const bestOn = {};
  for (const c of challenges) if (chDates.includes(c.date) && (!bestOn[c.date] || c.seconds < bestOn[c.date])) bestOn[c.date] = c.seconds;
  let fastest = Infinity, prDate = null, n = 0;
  for (const d of chDates) {
    if (bestOn[d] == null) continue;
    if (n > 0 && bestOn[d] < fastest && !prDate) prDate = d;
    fastest = Math.min(fastest, bestOn[d]); n++;
  }
  set('pr-jager', prDate);
  // PR-Machine: 3 Challenges met een nieuw PR
  let fast = Infinity, prs = [], k = 0;
  for (const d of chDates) {
    if (bestOn[d] == null) continue;
    if (k > 0 && bestOn[d] < fast) prs.push(d);
    fast = Math.min(fast, bestOn[d]); k++;
  }
  set('pr-machine', prs[2] || null, Math.min(prs.length, 3));
  // Challenge-Reeks: 6 op rij van de Challenges die zijn doorgegaan
  const held = [...new Set([...challengeDays, ...PAST_CHALLENGES, ...chDates])].filter((d) => d <= today).sort();
  const was = new Set(chDates);
  let cRun = 0, cDate = null;
  for (const d of held) { if (was.has(d)) { cRun++; if (cRun === 6 && !cDate) cDate = d; } else if (d < today) cRun = 0; }
  set('challenge-reeks', cDate, Math.min(cDate ? 6 : cRun, 6));
  // Volle Week: dinsdag getraind en dezelfde week (zaterdag erna) de Challenge
  const fullWeeks = chDates.filter((d) => went.has(addDays(d, -4)));
  set('volle-week', fullWeeks[4] || null, Math.min(fullWeeks.length, 5));

  // Events
  for (const ev of BADGE_EVENTS) for (const id of ev.badges) set(id, events[ev.key] || null);
  // Van het Eerste Uur: met de club gelopen vóór september 2025
  set('founding-member', trainings.find((d) => d < '2025-09-01') || null);

  // Handmatig toegekend door Beheer gaat altijd voor
  for (const [id, date] of Object.entries(awards)) if (BADGE[id]) res[id] = { ...res[id], earned: true, date: res[id]?.date || date, have: res[id]?.have ?? null };
  set('haas', awards.haas || null);

  return BADGES
    .map((b) => ({ ...b, ...(res[b.id] || { earned: false, date: null, have: null }) }))
    .filter((b) => b.earned || !b.secret); // geheime badges alleen tonen aan wie ze heeft
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
