// Vaste inhoud en rekenhulpjes voor de schermen (draait in de browser)

export const MON = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
export const DAY = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
export const DAY_LONG = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
export const TYPE_LABEL = { training: 'Training', special: 'Special', wedstrijd: 'Wedstrijd', challenge: '5km Challenge' };

export function dparts(iso) {
  const d = new Date(iso + 'T12:00:00');
  return { d: d.getDate(), m: MON[d.getMonth()], w: DAY[d.getDay()], W: DAY_LONG[d.getDay()] };
}
export function daysTo(iso) {
  const a = new Date(iso + 'T00:00:00');
  const b = new Date(); b.setHours(0, 0, 0, 0);
  return Math.round((a - b) / 864e5);
}
export function rel(iso) {
  const n = daysTo(iso);
  return n === 0 ? 'vandaag' : n === 1 ? 'morgen' : n < 0 ? 'geweest' : `over ${n} dagen`;
}
export function fmt(sec) {
  sec = Math.round(sec);
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
}
export function parseT(str) {
  if (!str) return NaN;
  const p = String(str).trim().split(/[:.]/).map(Number);
  if (p.some((x) => Number.isNaN(x))) return NaN;
  return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p.length === 2 ? p[0] * 60 + p[1] : p[0] * 60;
}
export const euro = (n) => '€ ' + n.toFixed(2).replace('.', ',');

export const DISTS = [['5 km', 5], ['10 km', 10], ['10 EM', 16.0934], ['Halve marathon', 21.0975], ['Marathon', 42.195]];

// Riegel: T2 = T1 × (D2/D1)^1,06
export const riegel = (t1, d1, d2) => t1 * Math.pow(d2 / d1, 1.06);

// Karvonen-zones op basis van hartslagreserve
export const ZONES = [
  ['1', 'Herstel, heel rustig', 0.5, 0.6],
  ['2', 'Duurloop, je kunt praten', 0.6, 0.7],
  ['3', 'Tempo, korte zinnen', 0.7, 0.8],
  ['4', 'Drempel, zwaar', 0.8, 0.9],
  ['5', 'Interval, maximaal', 0.9, 1],
];

// Splits per km; bij negative split is de eerste helft 1,5% trager en de tweede 1,5% sneller
export function splits(total, dist, negative) {
  const avg = total / dist;
  const rows = [];
  let cum = 0;
  for (let k = 1; k <= Math.ceil(dist - 1e-9); k++) {
    const len = Math.min(1, dist - (k - 1));
    const mid = k - 1 + len / 2;
    const pace = negative ? avg * (mid <= dist / 2 ? 1.015 : 0.985) : avg;
    cum += pace * len;
    rows.push({ km: len < 1 ? dist : k, split: pace * len, cum });
  }
  return rows;
}

// Voedingsplan op basis van ISSN/ACSM-bandbreedtes
export function fuelPlan({ seconds, weight, weather, gut }) {
  const min = seconds / 60;
  if (min < 75) return { none: true };
  const cho = min < 150 ? [30, 45, 60][gut] : [60, 75, 90][gut];
  const fuelMin = Math.max(0, min - 20);
  const gels = Math.ceil((cho * fuelMin) / 60 / 25);
  const water = Math.round(([450, 600, 800][weather] + ((weight || 70) - 70) * 4) / 50) * 50;
  const sodium = [300, 450, 650][weather];
  const every = gels ? fuelMin / gels : 0;
  const moments = Array.from({ length: gels }, (_, i) => (20 + every * i + every / 2) * 60);
  return { cho, gels, water, sodium, moments };
}

export const MODULES = [
  ['Zone 2 als fundament', 'Trainingswetenschap', 5, 'Waarom het meeste volume rustig hoort te zijn.', 'De meeste goede lopers doen zo\'n 80% van hun kilometers in een rustig tempo, waarbij je nog makkelijk kunt praten. Dat bouwt je hart, je haarvaten en je vetverbranding op zonder dat je herstel eronder lijdt. De harde trainingen worden daardoor beter, niet slechter.'],
  ['VO2max is trainbaar', 'Fysiologie', 6, 'Wat intervallen doen voor je zuurstofopname.', 'VO2max is hoeveel zuurstof je lichaam maximaal kan gebruiken. Intervallen van 3 tot 5 minuten op hoge intensiteit verhogen die waarde, ook bij recreatieve lopers. Eén zo\'n training per week is genoeg.'],
  ['Hardlopen versterkt botten', 'Fysiologie', 7, 'Impact als prikkel voor sterkere botten.', 'Bij elke landing krijgt je bot een kleine belasting. Daar reageert het op door sterker te worden. Bouw het volume geleidelijk op, zodat je botten de tijd krijgen om mee te groeien.'],
  ['Slaap = herstel', 'Fysiologie', 8, 'Diepe slaap en spierherstel.', 'In de diepe slaap maakt je lichaam groeihormoon aan en herstelt het je spieren. Wie structureel te kort slaapt, herstelt slechter en raakt sneller geblesseerd. Zeven tot negen uur is het doel.'],
  ['Koolhydraten boven 75 min', 'Voeding', 5, 'Wanneer je glycogeen opraakt en wat je dan doet.', 'Je spieren hebben een beperkte voorraad koolhydraten. Na ongeveer 75 minuten flink lopen raakt die op. Daarom eet je bij langere races onderweg 30 tot 90 gram koolhydraten per uur. Gebruik de voedingswizard voor je eigen plan.'],
  ['HRV als herstelmeter', 'Fysiologie', 6, 'Hartslagvariabiliteit lezen.', 'HRV is de variatie in tijd tussen je hartslagen. Een hogere waarde dan normaal wijst meestal op goed herstel, een lagere op vermoeidheid of stress. Kijk naar je eigen trend, niet naar de getallen van anderen.'],
  ['Cadans ≥ 170 spm', 'Blessurepreventie', 7, 'Kortere passen, minder schokbelasting.', 'Met een iets hogere pasfrequentie land je dichter onder je lichaam en neemt de klap per stap af. Verhoog je cadans in kleine stappen van 5%, niet in één keer.'],
  ['Tapering werkt', 'Trainingswetenschap', 8, 'Minder volume in de laatste weken voor een race.', 'In de twee tot drie weken voor een race verlaag je je volume met 40 tot 60%, maar houd je wat korte, snelle prikkels. Je lichaam herstelt dan volledig en je loopt frisser op de dag zelf.'],
  ['Lactaatdrempel', 'Fysiologie', 5, 'Het tempo waarop het omslaat.', 'Boven je lactaatdrempel maak je sneller melkzuur aan dan je kunt afvoeren, en dan houd je het tempo niet lang vol. Tempolopen rond die grens schuiven hem op, zodat je langer snel kunt lopen.'],
  ['Cold water immersion', 'Blessurepreventie', 6, 'Wat koud water wel en niet doet.', 'Een koud bad vermindert spierpijn en ontsteking op korte termijn. Direct na krachttraining kan het de aanpassing juist remmen. Gebruik het vooral in drukke wedstrijdperiodes.'],
  ['Schoenen en loopstijl', 'Uitrusting', 7, 'Wat het bewijs zegt over corrigerende schoenen.', 'Er is weinig bewijs dat schoenen die je loopstijl corrigeren blessures voorkomen. Comfort is de beste gids: kies de schoen die het prettigst voelt.'],
  ['Dehydratie', 'Voeding', 8, 'Wat 2% vochtverlies met je prestatie doet.', 'Verlies je meer dan zo\'n 2% van je lichaamsgewicht aan vocht, dan gaat je prestatie merkbaar omlaag, zeker als het warm is. Drink op dorst en weeg jezelf eens voor en na een lange duurloop om je zweetverlies te kennen.'],
  ['Mentale vermoeidheid', 'Mentaal', 5, 'Een vol hoofd kost uithoudingsvermogen.', 'Na een mentaal zware dag voelt dezelfde inspanning zwaarder. Plan je zwaarste trainingen daarom niet na je drukste werkdagen, en houd je hoofd rustig op de ochtend van een race.'],
  ['Loopeconomie', 'Trainingswetenschap', 6, 'Hoe zuinig je per kilometer loopt.', 'Loopeconomie is hoeveel energie je nodig hebt voor een bepaald tempo. Krachttraining, heuveltraining en veel kilometers maken je zuiniger, waardoor je hetzelfde tempo makkelijker volhoudt.'],
  ['Periodisering', 'Trainingswetenschap', 7, 'Basis, opbouw, piek en herstel.', 'Een goed seizoen bestaat uit blokken: eerst een basis van rustige kilometers, dan opbouw met meer intensiteit, een piek richting je race en daarna echt herstel. Na drie zwaardere weken volgt vaak een lichtere week.'],
];

export const SHIRTS = [
  ['Hardloopsinglet', 29.65, 'Bestseller · race fit'],
  ['Hardloopshirt korte mouw', 34.49, ''],
  ['Hardloopshirt lange mouw', 47.19, ''],
  ['Thermisch shirt LM', 61.11, 'Nieuw · half-zip'],
  ['Hardloopshort 3 inch', 50.82, 'Met sleutelvak'],
  ['Layered short (heren)', 67.16, 'Nieuw · 2-in-1'],
  ['Hardlooptight', 59.59, 'Winterstof'],
];

export const NOTIF_TYPES = [
  ['training', 'Trainingsherinnering', 'Op de trainingsdag om 16:00, met hoeveel mensen er komen'],
  ['events', 'Nieuwe specials en wedstrijden', 'Zodra er iets in de agenda komt'],
  ['challenge', '5km Challenge', 'De dag voor de Challenge'],
  ['carpool', 'Carpool', 'Als iemand met je meerijdt of een rit aanbiedt'],
  ['shirt', 'Bestelronde clubshirt', 'Als de bestelronde opengaat'],
];
