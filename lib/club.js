// Vaste clubgegevens. Pas hier de dinsdagtraining aan.
export const CLUB = {
  name: 'Hardloopclub BenneKOM',
  trainingDay: 2, // 0 = zondag, 2 = dinsdag
  trainingTime: '19:30',
  trainingPlace: 'Dunantlaan 18, Bennekom',
  trainingTitle: 'Clubtraining · duurloop',
  trainingText: 'Elke dinsdag samen lopen, alle niveaus. Wijzigingen staan op Strava.',
  weeksAhead: 8,
  strava: 'https://www.strava.com/clubs/1629265',
  instagram: 'https://www.instagram.com/bennekom_hardloopclub/',
};

// Vaste clubfoto's (bestanden in public/club/). w/h = breedte/hoogte in pixels.
// De eerste is de standaard achtergrond van de trainingskaart op de homepagina.
export const CLUB_PHOTOS = [
  { src: '/club/samen-lachen.jpg', caption: "Backyard Run · 31 oktober 2026", w: 1400, h: 1120 },
  { src: '/club/groep-in-de-mist.jpg', caption: "In de mist door de bossen", w: 1400, h: 1120 },
  { src: '/club/start-runners-world.jpg', caption: "Start onder de boog van Runners World", w: 1400, h: 933 },
  { src: '/club/lachend-onder-de-eiken.jpg', caption: "Lachend onder de eiken", w: 1400, h: 1120 },
  { src: '/club/juichen.jpg', caption: "Yes!", w: 1400, h: 1120 },
  { src: '/club/herfstlaan.jpg', caption: "Door de herfstlaan", w: 1120, h: 1400 },
  { src: '/club/duimen-omhoog.jpg', caption: "Duimen omhoog!", w: 1400, h: 1120 },
  { src: '/club/spieren-voor-spieren.jpg', caption: "Samen lopen voor Spieren voor Spieren", w: 1400, h: 933 },
  { src: '/club/alleen-in-de-mist.jpg', caption: "Herfstochtend", w: 1400, h: 1120 },
  { src: '/club/drie-op-een-rij.jpg', caption: "Lachend de ronde uit", w: 1400, h: 1120 },
  { src: '/club/bennekom-op-de-rug.jpg', caption: "BenneKOM op de rug", w: 1400, h: 1196 },
  { src: '/club/met-z-n-vieren.jpg', caption: "Met z'n vieren", w: 1400, h: 1120 },
  { src: '/club/jong-en-oud.jpg', caption: "Iedereen is welkom", w: 1400, h: 1120 },
  { src: '/club/weer-een-ronde.jpg', caption: "Op naar de volgende ronde", w: 1400, h: 933 },
  { src: '/club/tussen-de-bomen.jpg', caption: "Tussen de bomen", w: 1120, h: 1400 },
  { src: '/club/oranje-sokken.jpg', caption: "Kleur in de groep", w: 1400, h: 1120 },
  { src: '/club/samen-tempo.jpg', caption: "Samen tempo maken", w: 1400, h: 1120 },
  { src: '/club/door-de-boog.jpg', caption: "Door de boog", w: 1400, h: 933 },
  { src: '/club/close-up.jpg', caption: "Nog een ronde", w: 1400, h: 1120 },
  { src: '/club/vol-focus.jpg', caption: "Vol focus", w: 933, h: 1400 },
  { src: '/club/thumbs-up.jpg', caption: "Nog steeds lachen", w: 1400, h: 1120 },
  { src: '/club/schouder-aan-schouder.jpg', caption: "Schouder aan schouder", w: 1400, h: 1120 },
  { src: '/club/vier-in-de-mist.jpg', caption: "Herfst in Bennekom", w: 1400, h: 1120 },
];

// Vandaag als JJJJ-MM-DD in Nederlandse tijd
export function todayISO(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

function addDays(iso, n) {
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Wekelijkse trainingen erbij, behalve op dagen waar een event de training vervangt
export function withTrainings(events, today = todayISO()) {
  const skip = new Set(events.filter((e) => e.replaces_training).map((e) => e.date));
  const out = [];
  let d = today;
  while (new Date(d + 'T12:00:00Z').getUTCDay() !== CLUB.trainingDay) d = addDays(d, 1);
  for (let i = 0; i < CLUB.weeksAhead; i++, d = addDays(d, 7)) {
    if (skip.has(d)) continue;
    out.push({ id: 'training-' + d, type: 'training', title: CLUB.trainingTitle, date: d, time: CLUB.trainingTime, place: CLUB.trainingPlace, description: CLUB.trainingText, distances: '', capacity: null, registration: false, carpool: false, attend: true });
  }
  return [...events.filter((e) => e.date >= today), ...out].sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
}
