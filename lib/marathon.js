// Op weg naar Rotterdam: drie gezamenlijke key sessions richting de NN Marathon Rotterdam (zo 11 april 2027).
// Alle blokken gaan op tijd, niet op afstand: iedereen start tegelijk, dribbelt tegelijk en komt elkaar op de ronde tegen.
// De datums vallen niet samen met de Februariloop (13 feb), de CPC (14 mrt) of de 5km Challenge (laatste zaterdag).

export const MARATHON = {
  id: 'race-2027-04-11-nn-marathon-rotterdam',
  title: 'NN Marathon Rotterdam',
  date: '2027-04-11',
  time: '10:00',
};


// Blokken: e = in- of uitlopen (rustig), m = marathontempo (MP), d = dribbel
const E = (min, label) => ['e', min, label];
const M = (min) => ['m', min];
const D = (min) => ['d', min];

export const KEY_SESSIONS = [
  {
    id: 'keysession-1', n: 1, date: '2027-01-24', weeks: 11,
    intro: 'Instap: vier korte blokken om het tempo te leren voelen.',
    base: { text: '4 × 15 min MP · 3 min dribbel', blocks: [E(25, 'Inlopen'), M(15), D(3), M(15), D(3), M(15), D(3), M(15), E(20, 'Uitlopen')] },
    short: { text: '3 × 15 min MP · 3 min dribbel', blocks: [E(25, 'Inlopen'), M(15), D(3), M(15), D(3), M(15), E(20, 'Uitlopen')] },
  },
  {
    id: 'keysession-2', n: 2, date: '2027-02-21', weeks: 7,
    intro: 'Langer per blok: het tempo moet nu ook halverwege nog vanzelf gaan.',
    base: { text: '3 × 25 min MP · 3 min dribbel', blocks: [E(30, 'Inlopen'), M(25), D(3), M(25), D(3), M(25), E(25, 'Uitlopen')] },
    short: { text: '3 × 20 min MP · 3 min dribbel', blocks: [E(30, 'Inlopen'), M(20), D(3), M(20), D(3), M(20), E(25, 'Uitlopen')] },
  },
  {
    id: 'keysession-3', n: 3, date: '2027-03-21', weeks: 3,
    intro: 'De zwaarste en de generale repetitie. Loop hem in blokken, of zonder pauzes als één lang marathonblok.',
    base: { text: '3 × 35 min MP · 5 min dribbel', blocks: [E(25, 'Inlopen'), M(35), D(5), M(35), D(5), M(35), E(20, 'Uitlopen')] },
    short: { text: '3 × 30 min MP · 5 min dribbel', blocks: [E(25, 'Inlopen'), M(30), D(5), M(30), D(5), M(30), E(20, 'Uitlopen')] },
    long: { text: '85 min MP aan één stuk · voor ervaren lopers', blocks: [E(30, 'Inlopen'), M(85), E(35, 'Uitlopen')] },
  },
];

// Schattingen per tempo, uitgaand van je marathondoel
export const EASY_FACTOR = 1.18; // in- en uitlopen
export const JOG_FACTOR = 1.35; // dribbel tussen de blokken
export const mpPace = (goalMin) => (goalMin * 60) / 42.195; // sec/km

export function sessionStats(blocks, goalMin) {
  const mp = mpPace(goalMin);
  const pace = { e: mp * EASY_FACTOR, m: mp, d: mp * JOG_FACTOR };
  let min = 0, km = 0, mpKm = 0, mpMin = 0;
  for (const [t, m] of blocks) {
    const k = (m * 60) / pace[t];
    min += m; km += k;
    if (t === 'm') { mpKm += k; mpMin += m; }
  }
  return { min, km, mpKm, mpMin };
}

// Leesbare opbouw: inlopen, de marathonblokken, dribbel, uitlopen
export function sessionSteps(blocks) {
  const easy = blocks.filter((b) => b[0] === 'e');
  const mps = blocks.filter((b) => b[0] === 'm').map((b) => b[1]);
  const jogs = blocks.filter((b) => b[0] === 'd');
  const steps = [[easy[0][2], easy[0][1] + ' min rustig']];
  steps.push(['Marathontempo', mps.length === 1 ? mps[0] + ' min aan één stuk' : mps.join(' + ') + ' min']);
  if (jogs.length) steps.push(['Tussendoor', jogs.length + ' × ' + jogs[0][1] + ' min dribbel']);
  if (easy[1]) steps.push([easy[1][2], easy[1][1] + ' min rustig']);
  return steps;
}

// Bereik van de schuif voor het marathondoel (minuten)
export const GOAL_MIN = 140;
export const GOAL_MAX = 285;
