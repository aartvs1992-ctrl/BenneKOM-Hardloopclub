import { SEED_RACES } from './races';
// Extra informatie voor specials (kolom events.details). Aan te vullen via Beheer.
export const ZICHT = {
  name: 'Restaurant Zicht',
  role: 'Dorpsstraat 24, Bennekom',
  bio: 'Restaurant, bar en café midden in Bennekom, van chef-eigenaar Remco Slijkhuis. Nog niet zo lang in het dorp, maar echt een aanwinst. Ze koken met verse, seizoensgebonden en regionale producten. Naast pasta staan er nog veel meer gerechten op de kaart.',
  photo: '',
  url: 'https://restaurantzicht.nl/',
};
export const PASTA = {
  image: '/club/nazitten.jpg',
  story: 'Samen een rondje van 8 tot 10 km door Bennekom, in groepjes op je eigen tempo. Daarna schuiven we aan bij Restaurant Zicht voor een bord pasta: kies uit vlees, vis of vega.\n\nEen mooie avond om nieuwe clubgenoten te leren kennen, en om kennis te maken met een van de nieuwste aanwinsten van het dorp.',
  program: '18:00 Verzamelen\n18:15 Start van de loop, 8–10 km in groepjes\nSamen pasta eten bij Restaurant Zicht (vlees, vis of vega)',
  bring: 'Hardloopkleding en een lampje\nDroge kleren voor bij het eten',
  cost: '€17,50 per persoon, inclusief een alcoholvrij drankje. Pasta naar keuze: vlees, vis of vega.',
  meals: ['Vlees', 'Vis', 'Vega'],
  price: 17.5, // betalen via de app (bunq.me), na inschrijven
  host: ZICHT,
  // GPX-bestanden staan in public/routes. Een route zonder gpx en zonder strava wordt niet getoond.
  routes: [
    { label: '8 km', pace: '6:00–6:30 /km', gpx: '/routes/pasta-run-8km.gpx', strava: 'https://www.strava.com/routes/3557454135437102562' },
    { label: '10 km', pace: '5:30 /km', gpx: '/routes/pasta-run-10km.gpx', strava: 'https://www.strava.com/routes/3557452146356544588' },
  ],
};
export const KOEN = {
  name: 'Koen de Jong',
  role: 'Oprichter van Sportrusten',
  bio: 'Koen is schrijver en adem- en duurcoach. Met Sportrusten helpt hij sporters trainen op hartslag en ademhaling. Hij schreef onder meer Koud Kunstje met Wim Hof, een internationale bestseller, en De Hardlooprevolutie met Stans van der Poel. Daarnaast schrijft hij over ademhaling, kou, meditatie, voeding en hardlopen.',
  photo: '/club/koen-de-jong.jpg',
  url: 'https://www.sportrusten.nl/koen-de-jong-2/',
};
export const DIP = {
  image: '/club/groep-in-de-mist.jpg',
  story: 'Koen de Jong, oprichter van Sportrusten en co-auteur van Koud Kunstje met Wim Hof, vertelt eerst wat koudetraining met je lichaam doet en hoe je het veilig aanpakt.\n\nDaarna lopen we samen een duurloop naar de Rijn. Halverwege gaan we het water in, voor wie durft, en daarna lopen we warm terug naar Bennekom.',
  program: 'Verzamelen bij De Dorpsherberg\nToelichting over koudetraining door Koen de Jong\nDuurloop naar de Rijn\nDip in de Rijn\nTerug naar Bennekom',
  bring: 'Zwemkleding onder je loopkleding\nHanddoek en droge, warme kleren\nSlippers of waterschoenen',
  cost: '',
  host: KOEN,
};
// Key sessions richting de NN Marathon Rotterdam (het hele plan staat in Agenda › Op weg naar Rotterdam)
const KS_BRING = 'Gels of sportdrank om te oefenen (er staat een drinkpost op de ronde)\nJe marathonschoenen, of de schoenen die je wilt testen';
const ks = (image, story, program, extra = '') => ({ image, story: story + '\n\nHet hele plan, met je eigen tempo\'s en kilometers, vind je in de Agenda onder Op weg naar Rotterdam.', program, bring: KS_BRING + extra, cost: '' });
export const KEY_SESSION_DETAILS = {
  'keysession-1': ks('/club/groep-met-tempo.jpg',
    'De eerste van drie gezamenlijke key sessions richting Rotterdam. Alle blokken gaan op tijd: iedereen start tegelijk op het fluitsignaal, dribbelt tegelijk en komt elkaar op de ronde tegen. Ieder op zijn eigen marathontempo.',
    '25 min inlopen\n4 × 15 min op marathontempo, 3 min dribbel ertussen (kort: 3 × 15)\n20 min uitlopen'),
  'keysession-2': ks('/club/samen-tempo.jpg',
    'Sessie twee: langere blokken op marathontempo. Maak je nog niet zoveel kilometers, kies dan de korte variant.',
    '30 min inlopen\n3 × 25 min op marathontempo, 3 min dribbel ertussen (kort: 3 × 20)\n25 min uitlopen'),
  'keysession-3': ks('/club/klaar-voor-de-start.jpg',
    'De zwaarste en de generale repetitie, drie weken voor Rotterdam. Loop 3 × 30 minuten op marathontempo, of als ervaren loper zonder pauzes: 85 minuten aan één stuk. Zelfde start en ronde, dus je loopt hem toch samen.',
    '30 min inlopen\n3 × 30 min op marathontempo, 5 min dribbel ertussen (of 85 min aan één stuk)\n30 min uitlopen',
    '\nJe racedag-ontbijt en wedstrijdkleding: alles zoals op 11 april'),
};
export const DEFAULT_DETAILS = { 'pasta-run': PASTA, 'run-dip-run': DIP, ...KEY_SESSION_DETAILS };

// Zelfde startdata als supabase/schema.sql — gebruikt zolang er geen database gekoppeld is.
export const SEED_EVENTS_BASE = [
  { id: 'dorpsrun-renswoude', type: 'wedstrijd', title: 'Dorpsrun Renswoude', date: '2026-11-07', time: '', place: 'Renswoude', description: 'Race in de regio. De club gaat samen; regel je rit via de carpool.', distances: 'Kidsrun · 5 km · 10 km · 21,1 km', capacity: null, registration: false, carpool: true, replaces_training: false },
  { id: 'pasta-run', type: 'special', title: 'Run Pasta Run', date: '2026-11-17', time: '18:00', place: 'Dunantlaan 10–12, Bennekom', description: '8 tot 10 km samen lopen en daarna samen eten. Vervangt deze dinsdag de gewone training.', distances: '', capacity: null, registration: true, carpool: false, replaces_training: true, details: PASTA },
  { id: 'challenge-2026-11', type: 'challenge', title: 'BenneKOM 5km Challenge', date: '2026-11-28', time: '10:00', place: 'Langschoterweg 7, Bennekom', description: 'Test jezelf op 5 km, loop samen of haas een ander naar een mooie tijd. Elke laatste zaterdag van de maand.', distances: '5 km', capacity: null, registration: true, carpool: false, replaces_training: false },
  { id: 'run-dip-run', type: 'special', title: 'Run-Dip-Run met Sportrusten', date: '2026-12-19', time: '', place: 'De Dorpsherberg, Bennekom', description: 'Toelichting over koudetraining door Koen de Jong van Sportrusten, dan een duurloop naar de Rijn met een dip halverwege en terug naar Bennekom.', distances: '5–10 km', capacity: 40, registration: true, carpool: false, replaces_training: false, details: DIP },
  { id: 'keysession-1', type: 'special', title: 'Key session 1 · Op weg naar Rotterdam', date: '2027-01-24', time: '', place: 'Bennekom', description: 'Lange zondagsessie met 4 × 15 min op marathontempo. Alle niveaus, iedereen op zijn eigen tempo.', distances: '1u54 · ±16–30 km', capacity: null, registration: true, carpool: false, replaces_training: false, details: KEY_SESSION_DETAILS['keysession-1'] },
  { id: 'keysession-2', type: 'special', title: 'Key session 2 · Op weg naar Rotterdam', date: '2027-02-21', time: '', place: 'Bennekom', description: 'Lange zondagsessie met 3 × 25 min op marathontempo. Alle niveaus, iedereen op zijn eigen tempo.', distances: '2u16 · ±20–36 km', capacity: null, registration: true, carpool: false, replaces_training: false, details: KEY_SESSION_DETAILS['keysession-2'] },
  { id: 'keysession-3', type: 'special', title: 'Key session 3 · Op weg naar Rotterdam', date: '2027-03-21', time: '', place: 'Bennekom', description: 'De generale repetitie: 3 × 30 min op marathontempo of 85 min aan één stuk.', distances: '2u30–2u40 · ±23–42 km', capacity: null, registration: true, carpool: false, replaces_training: false, details: KEY_SESSION_DETAILS['keysession-3'] },
  { id: 'challenge-2026-12', type: 'challenge', title: 'BenneKOM 5km Challenge', date: '2026-12-26', time: '10:00', place: 'Langschoterweg 7, Bennekom', description: 'De laatste Challenge van het jaar.', distances: '5 km', capacity: null, registration: true, carpool: false, replaces_training: false },
];

export const SEED_NEWS = [];

export const SEED_EVENTS = [...SEED_EVENTS_BASE, ...SEED_RACES];

export const SEED_MEDIA = [
  { outlet: 'Ede Stad', title: 'De groei van BenneKOM', published: '2025-11', url: '', summary: 'Over hoe de loopclub in Bennekom in korte tijd groeide.' },
  { outlet: 'De Gelderlander', title: 'Tweeling-ouders die samen op het podium staan', published: '', url: '', summary: 'Een ouderpaar van een tweeling dat maandelijks honderden kilometers loopt.' },
];

export const SEED_PARTNERS = [
  { name: 'Runners World Ede', about: 'Hardloopspeciaalzaak in Ede voor schoenen, kleding en advies. Partner van BenneKOM en bekend van de finishboog bij de Backyard Run.', benefit: '10% korting op hardloopschoenen en kleding', code: '', how: 'Laat bij de kassa weten dat je lid bent van BenneKOM.', url: '', sort: 1 },
  { name: 'Fitsynergy', about: 'Webshop voor sportvoeding, magnesium, vitamines en supplementen, met merken als Maurten en Humantra.', benefit: 'Korting op je bestelling', code: 'BenneKOM10', how: 'Vul de code in bij het afrekenen in de webshop.', url: 'https://www.fitsynergy.nl/', sort: 2 },
  { name: 'Thrive', about: 'Belgisch alcoholvrij sportbier met 10 gram proteïne per blikje, ontwikkeld met de KU Leuven. Ideaal na de training of wedstrijd. Ook hun nieuwe electrolyte soda’s met 0 gram suiker.', benefit: '10% korting in de webshop', code: 'BenneKOM10', how: 'Vul de code in bij het afrekenen op thrivebeer.com.', url: 'https://www.thrivebeer.com/', sort: 3 },
];
