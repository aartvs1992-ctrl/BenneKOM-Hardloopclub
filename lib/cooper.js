// Coopertest: zo ver mogelijk in 12 minuten.
// Kalibratie via Jack Daniels (VDOT), trainen volgens Marius Bakken: zijn drempeltempo ligt 2% rustiger dan Daniels' T-tempo.

export const COOPER_MIN = 12;

// Daniels/Gilbert: zuurstofkosten bij snelheid v (m/min) en het deel van je VDOT dat je t minuten volhoudt
const vo2 = (v) => -4.6 + 0.182258 * v + 0.000104 * v * v;
const pctMax = (t) => 0.8 + 0.1894393 * Math.exp(-0.012778 * t) + 0.2989558 * Math.exp(-0.1932605 * t);

export function vdot(meters) {
  return vo2(meters / COOPER_MIN) / pctMax(COOPER_MIN);
}

// Tempo (sec/km) dat hoort bij een bepaald deel van je VDOT
function paceAt(v, frac) {
  const target = v * frac;
  const a = 0.000104, b = 0.182258, c = -4.6 - target;
  const speed = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a); // m/min
  return 60000 / speed;
}

// Voorspelde wedstrijdtijd (sec) over `meters` bij deze VDOT (Daniels): zoek de tijd waarbij de inspanning precies past
export function raceTime(v, meters) {
  let lo = 60, hi = 6 * 3600;
  for (let i = 0; i < 60; i++) {
    const t = (lo + hi) / 2;
    const need = vo2(meters / (t / 60)) / pctMax(t / 60);
    if (need > v) lo = t; else hi = t;
  }
  return (lo + hi) / 2;
}

export const BAKKEN_FACTOR = 1.02; // 2% rustiger dan Daniels T

// Alle tempo's uit één coopertest (sec/km)
export function cooperPaces(meters) {
  const v = vdot(meters);
  const danielsT = paceAt(v, 0.88);
  const B = danielsT * BAKKEN_FACTOR; // Bakken-drempel
  return {
    vdot: v,
    testPace: (COOPER_MIN * 60 * 1000) / meters,
    danielsT,
    bakken: B,
    // De basis, volgens Bakken en altijd onder de drempel: threshold voor korte herhalingen, sub-threshold voor lange blokken
    threshold: [B, B * 1.02], // 1–4 min
    subthreshold: [B * 1.02, B * 1.05], // 5–10 min
    // Rustig mag écht rustig: een brede range, ook ver onder je kunnen is goed
    easy: [B * 1.25, B * 1.6],
    // Harder dan Bakken mag, zolang het niet het grootste deel van je volume is: deze tempo's volgens Daniels
    vo2max: [paceAt(v, 1.0), paceAt(v, 0.975)],
    // Strides: ontspannen snel, rond je 1500 m-wedstrijdtempo
    strides: (() => { const p = raceTime(v, 1500) / 1.5; return [p * 0.97, p]; })(),
    races: [5000, 10000].map((d) => { const t = raceTime(v, d); return { meters: d, time: t, pace: t / (d / 1000) }; }),
  };
}

export const COOPER_INFO = {
  title: 'Geen examen, maar een kalibratie',
  text: 'De coopertest is een nulmeting: waar sta je nu, en op welke tempo\'s train je de komende weken? Zie het dus niet te veel als een test. Twaalf minuten zo ver mogelijk, op een vlak stuk asfalt. Loop gelijkmatig: wie te hard start, zakt in en krijgt tempo\'s die te langzaam zijn. Vul de afstand van je horloge in. Gps kan een paar procent afwijken, kijk daarom vooral naar je eigen progressie. Uit je afstand rekenen we je niveau (VDOT van Jack Daniels) en daaruit je tempo\'s voor de intervallen volgens Marius Bakken.',
};
