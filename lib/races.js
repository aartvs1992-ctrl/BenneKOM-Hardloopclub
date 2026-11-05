// Wedstrijden in de regio (binnen 50 km van Bennekom), november 2026 – april 2027.
// Bron: hardloopkalendernederland.nl, nextrace.nl en runinfo.nl (opgehaald 2 nov 2026).
// Controleer datum en inschrijving altijd op de site van de organisatie.
const R = (date, title, place, distances, url = '') => ({
  id: 'race-' + date + '-' + title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  type: 'wedstrijd', title, date, time: '', place, distances, url,
  description: 'Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.',
  capacity: null, registration: false, carpool: true, replaces_training: false,
});

export const SEED_RACES = [
  R('2026-11-07', 'Hydro Trailrun', 'Harderwijk', '12 · 22 · 30 · 43 km'),
  R('2026-11-07', 'Najaarsloop Cialfo', 'Epe', '5 · 10 · 21,1 km'),
  R('2026-11-14', 'Zevenheuvelennacht', 'Nijmegen', '7 km'),
  R('2026-11-14', 'Vlinderloop', 'Houten', '4,4 · 10,7 · 14,8 · 21,1 km'),
  R('2026-11-15', 'Zevenheuvelenloop', 'Nijmegen', '15 km', 'https://www.zevenheuvelenloop.nl'),
  R('2026-11-20', 'Utrecht Science Park Night Run', 'Utrecht', '5 · 10 km'),
  R('2026-11-20', 'Night Trail Run', 'Nieuwegein', '5 · 7,5 · 15 km'),
  R('2026-11-22', 'Trailrun Maarten Maartens', 'Doorn', '6 · 10 · 20 km'),
  R('2026-11-28', 'Horaloop', 'Ede', '5 · 10 · 16 km'),
  R('2026-11-28', 'Walvoort Rondje Nederland Avondloop', 'Arnhem', '5 km (+ jeugd)'),
  R('2026-12-05', 'Sint-Nicolaasloop', 'Bunschoten-Spakenburg', '3 · 5 · 10 · 15 km'),
  R('2026-12-12', 'Vlinderloop', 'Houten', '4,4 · 10,7 · 14,8 · 21,1 km'),
  R('2026-12-18', 'Kerstmannenloop', 'Amersfoort', '5 km'),
  R('2026-12-19', 'Natte Neuzen Kerst Trail', 'Arnhem', '7,5 · 10 km'),
  R('2026-12-20', 'Dijkencross', 'Pannerden', '2,5 · 5 · 10 km'),
  R('2026-12-27', 'Physique 3de Kerstdagloop', 'Arnhem', '7 · 14,3 · 21,1 km'),
  R('2026-12-30', 'Sylvestercross by Night', 'Soest', '3,9 km'),
  R('2026-12-31', 'Sylvestercross', 'Soest', '9,6 km'),
  R('2027-01-02', 'Florijnwinterloop', 'Woudenberg', '5 · 10 · 16,1 km'),
  R('2027-01-09', 'Vlinderloop', 'Houten', '4,4 · 10,7 · 14,8 · 21,1 km'),
  R('2027-01-17', 'Leemkuilcross', 'Berg en Dal', 'diverse afstanden'),
  R('2027-01-24', 'Safari Trail', 'Arnhem', '5,1 · 12 · 24 km'),
  R('2027-01-31', 'Amersfoortse Bergcross', 'Amersfoort', '2,5 · 5 · 7,5 · 10 km'),
  R('2027-01-31', 'Beekse Winterbosloop', 'Beek (Montferland)', '5 · 10 km'),
  R('2027-02-05', 'Midwintermarathon', 'Apeldoorn', '8 · 16,1 · 25 km (5–7 feb)', 'https://www.midwintermarathon.nl'),
  R('2027-02-13', 'Februariloop', 'Bennekom', '2 · 5 · 10 · 21 km'),
  R('2027-03-06', '3bergenloop', 'Driebergen-Rijsenburg', '6 · 12 · 21 km'),
  R('2027-03-13', 'Vlinderloop', 'Houten', '4,4 · 10,7 · 14,8 · 21,1 km'),
  R('2027-03-20', 'Urban Trail Stevens Stadscross', 'Nijmegen', '7 km'),
  R('2027-03-21', 'Stevensloop', 'Nijmegen', '5 · 10 · 21,1 km'),
  R('2027-04-17', 'Amerongse Koploop Trailrun', 'Amerongen', '6 · 10 · 16 · 25 km'),
];

// Hemelsbrede afstand van Bennekom naar bekende plaatsen in de regio
const HOME = [52.0005, 5.6765];
const PLACES = {
  bennekom: [52.0005, 5.6765], ede: [52.040, 5.665], wageningen: [51.970, 5.664], renkum: [51.977, 5.733],
  oosterbeek: [51.986, 5.845], arnhem: [51.985, 5.899], velp: [51.995, 5.975], rheden: [52.010, 6.030],
  veenendaal: [52.027, 5.556], rhenen: [51.959, 5.568], renswoude: [52.073, 5.539], barneveld: [52.140, 5.585],
  lunteren: [52.086, 5.622], scherpenzeel: [52.080, 5.488], otterlo: [52.100, 5.771], nijmegen: [51.842, 5.853],
  'berg en dal': [51.822, 5.917], elst: [51.919, 5.848], apeldoorn: [52.211, 5.969], epe: [52.348, 5.983],
  harderwijk: [52.342, 5.620], amersfoort: [52.156, 5.388], woudenberg: [52.081, 5.418], leusden: [52.132, 5.431],
  doorn: [52.033, 5.344], 'driebergen-rijsenburg': [52.053, 5.281], amerongen: [51.998, 5.459], zeist: [52.089, 5.233], soest: [52.174, 5.292],
  soesterberg: [52.118, 5.288], houten: [52.033, 5.168], utrecht: [52.091, 5.122], nieuwegein: [52.030, 5.083],
  'bunschoten-spakenburg': [52.243, 5.377], pannerden: [51.890, 6.040], 'beek (montferland)': [51.902, 6.185],
  tiel: [51.887, 5.430], culemborg: [51.955, 5.227], 'wijk bij duurstede': [51.975, 5.345], putten: [52.259, 5.606],
  voorthuizen: [52.185, 5.607], dieren: [52.052, 6.102], zevenaar: [51.927, 6.072], doesburg: [52.013, 6.140],
};

export function kmFromBennekom(place) {
  const key = String(place || '').split(',')[0].trim().toLowerCase();
  const p = PLACES[key];
  if (!p) return null;
  const t = Math.PI / 180, dLat = (p[0] - HOME[0]) * t, dLon = (p[1] - HOME[1]) * t;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(HOME[0] * t) * Math.cos(p[0] * t) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)));
}
