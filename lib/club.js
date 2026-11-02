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
  { src: '/club/met-een-glimlach.jpg', caption: "Met een glimlach", w: 1400, h: 1120 },
  { src: '/club/eenzaam-in-de-mist.jpg', caption: "Rustig door de mist", w: 1400, h: 1120 },
  { src: '/club/portret-in-de-mist.jpg', caption: "Lekker bezig", w: 1120, h: 1400 },
  { src: '/club/duimen-in-de-lucht.jpg', caption: "Duimen in de lucht", w: 1400, h: 1120 },
  { src: '/club/samen-duimen.jpg', caption: "Samen=leuker", w: 1400, h: 933 },
  { src: '/club/duim-omhoog.jpg', caption: "Duim omhoog", w: 1400, h: 1120 },
  { src: '/club/napraten.jpg', caption: "Even napraten", w: 1400, h: 1120 },
  { src: '/club/clubshirts.jpg', caption: "In clubshirt door de mist", w: 1400, h: 1120 },
  { src: '/club/over-het-zandpad.jpg', caption: "Over het fietspad", w: 1400, h: 933 },
  { src: '/club/samen-uitlopen.jpg', caption: "Samen uitlopen", w: 1400, h: 1120 },
  { src: '/club/genieten.jpg', caption: "Genieten", w: 788, h: 1400 },
  { src: '/club/pet-op.jpg', caption: "Pet op, lach erbij", w: 933, h: 1400 },
  { src: '/club/in-gesprek.jpg', caption: "Lopen en kletsen", w: 1120, h: 1400 },
  { src: '/club/met-z-n-drieen.jpg', caption: "Met z'n drieën", w: 1400, h: 1120 },
  { src: '/club/reflecterend.jpg', caption: "Goed zichtbaar", w: 1400, h: 1120 },
  { src: '/club/rustig-tempo.jpg', caption: "Rustig tempo", w: 1400, h: 933 },
  { src: '/club/jong-talent.jpg', caption: "Jong talent", w: 1400, h: 1120 },
  { src: '/club/vol-plezier.jpg', caption: "Vol plezier", w: 933, h: 1400 },
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
