// Vaste clubgegevens. Pas hier de dinsdagtraining aan.
export const CLUB = {
  name: 'Hardloopclub BenneKOM',
  trainingDay: 2, // 0 = zondag, 2 = dinsdag
  trainingTime: '19:30',
  trainingPlace: 'Dunantlaan 18, Bennekom',
  // Om de week wisselen: de interval-dinsdagen tellen vanaf intervalFrom, de andere dinsdagen zijn duurloop.
  intervalFrom: '2026-11-10',
  trainings: {
    duurloop: { title: 'Duurloop', text: 'Rustige duurloop in groepjes op je eigen tempo, alle niveaus welkom. Wijzigingen staan op Strava.' },
    interval: { title: 'Intervaltraining', text: 'Intervaltraining: na een gezamenlijke warming-up blokken op tempo met rustige herstelstukken, in groepjes op niveau. Alle niveaus welkom. Wijzigingen staan op Strava.' },
  },
  weeksAhead: 8,
  strava: 'https://www.strava.com/clubs/1629265',
  // Fysiotherapeut voor pijntjes en blessures. Lege velden worden niet getoond.
  physio: {
    name: 'David Hemstede',
    role: 'Sportfysiotherapeut',
    practice: 'Centrum Evers, Barneveld',
    address: 'Nieuwe Markt 1 C, Barneveld',
    phone: '+31 6 55 36 33 82',
    practicePhone: '0342-422997',
    email: 'davidhemstede@hotmail.com',
    url: 'https://www.centrumevers.nl',
    photo: '/club/david-hemstede.jpg',
    action: '/club/david-trail.jpg',
  },
  instagram: 'https://www.instagram.com/bennekom_hardloopclub/',
};

// Vaste clubfoto's (bestanden in public/club/). w/h = breedte/hoogte in pixels.
// De eerste is de standaard achtergrond van de trainingskaart op de homepagina.
export const CLUB_PHOTOS = [
  { src: '/club/samen-lachen.jpg', caption: "Backyard Run · 31 oktober 2026", w: 1400, h: 1120 },
  { src: '/club/de-hele-groep.jpg', caption: "De hele groep onderweg", w: 1400, h: 788 },
  { src: '/club/groep-in-de-laan.jpg', caption: "Samen door de laan", w: 1400, h: 788 },
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
  { src: '/club/voorop.jpg', caption: "Voorop", w: 1400, h: 788 },
  { src: '/club/kletsen-onderweg.jpg', caption: "Kletsen onderweg", w: 1400, h: 788 },
  { src: '/club/lachen-onderweg.jpg', caption: "Lachen onderweg", w: 1400, h: 788 },
  { src: '/club/muts-op.jpg', caption: "Muts op", w: 788, h: 1400 },
  { src: '/club/in-formatie.jpg', caption: "In formatie", w: 1400, h: 1120 },
  { src: '/club/peace.jpg', caption: "Peace!", w: 1400, h: 1120 },
  { src: '/club/zwaaien-naar-de-camera.jpg', caption: "Zwaaien naar de camera", w: 1400, h: 1120 },
  { src: '/club/duimen-voor-de-club.jpg', caption: "Duimen voor de club", w: 1400, h: 1120 },
  { src: '/club/samen-op-pad.jpg', caption: "Samen op pad", w: 1400, h: 933 },
  { src: '/club/duim-omhoog-onderweg.jpg', caption: "Duim omhoog onderweg", w: 1400, h: 1120 },
  { src: '/club/beukenlaan.jpg', caption: "Door de beukenlaan", w: 1400, h: 1120 },
  { src: '/club/wijzen-en-lachen.jpg', caption: "Wijzen en lachen", w: 933, h: 1400 },
  { src: '/club/klaar-voor-de-start.jpg', caption: "Klaar voor het werk", w: 1120, h: 1400 },
  { src: '/club/viertal.jpg', caption: "Viertal in het bos", w: 1400, h: 1120 },
  { src: '/club/groep-lacht.jpg', caption: "De groep lacht", w: 1400, h: 788 },
  { src: '/club/duo-in-het-blauw.jpg', caption: "Duo onderweg", w: 1400, h: 933 },
  { src: '/club/solo-in-clubshirt.jpg', caption: "In clubshirt door Bennekom", w: 1400, h: 788 },
  { src: '/club/door-de-heg.jpg', caption: "Even gluren", w: 1400, h: 1120 },
  { src: '/club/groep-met-tempo.jpg', caption: "Samen tempo houden", w: 800, h: 1200 },
  { src: '/club/voorop-lopen.jpg', caption: "Voorop", w: 800, h: 1200 },
  { src: '/club/duo-duim.jpg', caption: "Duim omhoog in het bos", w: 1200, h: 800 },
  { src: '/club/vier-in-blauw.jpg', caption: "Vier in het blauw", w: 1200, h: 960 },
  { src: '/club/van-achteren.jpg', caption: "BenneKOM op de rug", w: 1200, h: 960 },
  { src: '/club/uitleg-onderweg.jpg', caption: "Uitleg onderweg", w: 1200, h: 800 },
  { src: '/club/vuist-omhoog.jpg', caption: "Vuist omhoog", w: 1200, h: 960 },
  { src: '/club/solo-in-het-zwart.jpg', caption: "Solo door de laan", w: 675, h: 1200 },
  { src: '/club/rustig-solo.jpg', caption: "Rustig tempo", w: 800, h: 1200 },
  { src: '/club/lachend-solo.jpg', caption: "Met een lach", w: 800, h: 1200 },
  { src: '/club/drie-op-pad.jpg', caption: "Drie op pad", w: 1200, h: 800 },
  { src: '/club/koffie-na.jpg', caption: "Koffie na afloop", w: 1200, h: 800 },
  { src: '/club/nazitten.jpg', caption: "Nazitten op het terras", w: 1200, h: 800 },
  { src: '/club/karikaturenwand.jpg', caption: "De BenneKOM-wand van de Backyard Run", w: 960, h: 1200 },
  { src: '/club/karikaturenwand-2.jpg', caption: "Alle lopers op de wand", w: 1200, h: 800 },
  { src: '/club/duimen-uitleg.jpg', caption: "Duimen omhoog", w: 1200, h: 800 },
  { src: '/club/drie-generaties.jpg', caption: "Drie generaties", w: 1200, h: 800 },
  { src: '/club/duimen-solo.jpg', caption: "Twee duimen omhoog", w: 800, h: 1200 },
  { src: '/club/duo-rustig.jpg', caption: "Samen rustig", w: 1200, h: 800 },
  { src: '/club/duo-lachend.jpg', caption: "Samen lachen", w: 1200, h: 800 },
  { src: '/club/duo-blij.jpg', caption: "Blij onderweg", w: 1200, h: 800 },
  { src: '/club/rekken-na-afloop.jpg', caption: "Even rekken na de ronde", w: 1200, h: 800 },
  { src: '/club/bijpraten-spieren-voor-spieren.jpg', caption: "Bijpraten bij Spieren voor Spieren", w: 1200, h: 800 },
  { src: '/club/supporters-bij-de-boog.jpg', caption: "Supporters bij de boog", w: 960, h: 1200 },
  { src: '/club/binnenkomst-onder-de-boog.jpg', caption: "Binnenkomst onder de boog", w: 1200, h: 960 },
  { src: '/club/finish-felicitaties.jpg', caption: "Felicitaties na de ronde", w: 1200, h: 800 },
  { src: '/club/tussen-de-rondes.jpg', caption: "Tussen de rondes", w: 1200, h: 800 },
  { src: '/club/proost-backyard.jpg', caption: "Proost op de Backyard Run", w: 1200, h: 960 },
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

// Duurloop of interval op een dinsdag (om de twee weken interval)
export function trainingKind(iso) {
  const weeks = Math.round((new Date(iso + 'T12:00:00Z') - new Date(CLUB.intervalFrom + 'T12:00:00Z')) / (7 * 864e5));
  return ((weeks % 2) + 2) % 2 === 0 ? 'interval' : 'duurloop';
}

// Wekelijkse trainingen erbij, behalve op dagen waar een event de training vervangt
export function withTrainings(events, today = todayISO()) {
  const skip = new Set(events.filter((e) => e.replaces_training).map((e) => e.date));
  const out = [];
  let d = today;
  while (new Date(d + 'T12:00:00Z').getUTCDay() !== CLUB.trainingDay) d = addDays(d, 1);
  for (let i = 0; i < CLUB.weeksAhead; i++, d = addDays(d, 7)) {
    if (skip.has(d)) continue;
    const t = CLUB.trainings[trainingKind(d)];
    out.push({ id: 'training-' + d, type: 'training', kind: trainingKind(d), title: t.title, date: d, time: CLUB.trainingTime, place: CLUB.trainingPlace, description: t.text, distances: '', capacity: null, registration: false, carpool: false, attend: true });
  }
  return [...events.filter((e) => e.date >= today), ...out].sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
}

// Clubfoto's per moment, voor het filter op de fotopagina. Alle huidige clubfoto's zijn van de Backyard Run.
export const clubAlbum = () => ({ album: 'Backyard Run', date: '2026-10-31' });

// Clubvideo's: staan in de app zelf (niet in Supabase), bovenaan hun album op de fotopagina
export const CLUB_VIDEOS = [
  { src: '/media/backyard-aftermovie.mp4', poster: '/media/backyard-aftermovie.jpg', title: 'Aftermovie Backyard Run', album: 'Backyard Run', date: '2026-10-31', w: 576, h: 1024, duration: 88 },
];
