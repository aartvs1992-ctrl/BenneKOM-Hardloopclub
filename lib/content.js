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

export const SHIRTS = [
  { id: 'kort', name: 'Clubshirt korte mouw', price: 35, note: 'Navy met gouden BenneKOM-logo voor en achter' },
  { id: 'lang', name: 'Clubshirt lange mouw', price: 40, note: 'Zelfde shirt, voor de koudere maanden' },
];
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const NOTIF_TYPES = [
  ['training', 'Trainingsherinnering', 'Op de trainingsdag om 16:00, met hoeveel mensen er komen'],
  ['events', 'BenneKOM-evenementen', 'Als er een nieuwe special van de club in de agenda komt, en de dag ervoor een herinnering'],
  ['races', 'Nieuwe wedstrijden in de regio', 'Als er een wedstrijd in de agenda komt'],
  ['signups', 'Wie doet er mee', 'Als een clubgenoot zich aanmeldt voor een special of wedstrijd'],
  ['deadlines', 'Inschrijfdeadlines', 'Een week en een dag voordat de inschrijving sluit'],
  ['challenge', '5km Challenge', 'De dag voor de Challenge'],
  ['carpool', 'Carpool', 'Als iemand met je meerijdt of een rit aanbiedt'],
  ['shirt', 'Bestelronde clubshirt', 'Als de bestelronde opengaat'],
];
