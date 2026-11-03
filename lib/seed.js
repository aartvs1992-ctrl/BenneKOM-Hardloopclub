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
  story: 'Samen een rondje van 8 tot 10 km door Bennekom en de bossen, in groepjes op je eigen tempo. Daarna schuiven we aan bij Restaurant Zicht voor een bord pasta.\n\nEen mooie avond om nieuwe clubgenoten te leren kennen, en om kennis te maken met een van de nieuwste aanwinsten van het dorp.',
  program: '18:00 Verzamelen\n18:15 Start van de loop, 8–10 km in groepjes\nSamen pasta eten bij Restaurant Zicht',
  bring: 'Hardloopkleding en een lampje\nDroge kleren voor bij het eten',
  cost: '',
  host: ZICHT,
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
export const DEFAULT_DETAILS = { 'pasta-run': PASTA, 'run-dip-run': DIP };

// Zelfde startdata als supabase/schema.sql — gebruikt zolang er geen database gekoppeld is.
export const SEED_EVENTS_BASE = [
  { id: 'dorpsrun-renswoude', type: 'wedstrijd', title: 'Dorpsrun Renswoude', date: '2026-11-07', time: '', place: 'Renswoude', description: 'Race in de regio. De club gaat samen; regel je rit via de carpool.', distances: 'Kidsrun · 5 km · 10 km · 21,1 km', capacity: null, registration: false, carpool: true, replaces_training: false },
  { id: 'pasta-run', type: 'special', title: 'Run Pasta Run', date: '2026-11-17', time: '18:00', place: 'Dunantlaan 10–12, Bennekom', description: '8 tot 10 km samen lopen en daarna samen eten. Vervangt deze dinsdag de gewone training.', distances: '', capacity: null, registration: true, carpool: false, replaces_training: true, details: PASTA },
  { id: 'challenge-2026-11', type: 'challenge', title: 'BenneKOM 5km Challenge', date: '2026-11-28', time: '10:00', place: 'Langschoterweg 7, Bennekom', description: 'Test jezelf op 5 km, loop samen of haas een ander naar een mooie tijd. Elke laatste zaterdag van de maand.', distances: '5 km', capacity: null, registration: true, carpool: false, replaces_training: false },
  { id: 'run-dip-run', type: 'special', title: 'Run-Dip-Run met Sportrusten', date: '2026-12-19', time: '', place: 'De Dorpsherberg, Bennekom', description: 'Toelichting over koudetraining door Koen de Jong van Sportrusten, dan een duurloop naar de Rijn met een dip halverwege en terug naar Bennekom.', distances: '5–10 km', capacity: 40, registration: true, carpool: false, replaces_training: false, details: DIP },
  { id: 'challenge-2026-12', type: 'challenge', title: 'BenneKOM 5km Challenge', date: '2026-12-26', time: '10:00', place: 'Langschoterweg 7, Bennekom', description: 'De laatste Challenge van het jaar.', distances: '5 km', capacity: null, registration: true, carpool: false, replaces_training: false },
];

export const SEED_NEWS = [
  { author: 'Bestuur', title: 'Run-Dip-Run in Bennekom', body: 'Samen met Sportrusten: uitleg over koudetraining, een rustig rondje en een duik in de Rijn.', event_id: 'run-dip-run', published_at: '2026-05-12' },
  { author: 'Wilco', title: 'Nieuwe website', body: 'De club heeft een nieuwe site met kalender, calculator, agenda en meer.', event_id: null, published_at: '2026-04-22' },
];

export const SEED_EVENTS = [...SEED_EVENTS_BASE, ...SEED_RACES];

export const SEED_MEDIA = [
  { outlet: 'Ede Stad', title: 'De groei van BenneKOM', published: '2025-11', url: '', summary: 'Over hoe de loopclub in Bennekom in korte tijd groeide.' },
  { outlet: 'De Gelderlander', title: 'Tweeling-ouders die samen op het podium staan', published: '', url: '', summary: 'Een ouderpaar van een tweeling dat maandelijks honderden kilometers loopt.' },
];

export const SEED_PARTNERS = [
  { name: 'Runners World Ede', about: 'Hardloopspeciaalzaak in Ede voor schoenen, kleding en advies. Partner van BenneKOM en bekend van de finishboog bij de Backyard Run.', benefit: '10% korting op hardloopschoenen en kleding', code: '', how: 'Laat bij de kassa weten dat je lid bent van BenneKOM.', url: '', sort: 1 },
  { name: 'Fitsynergy', about: 'Webshop voor sportvoeding, magnesium, vitamines en supplementen, met merken als Maurten en Humantra.', benefit: 'Korting op je bestelling', code: 'BenneKOM10', how: 'Vul de code in bij het afrekenen in de webshop.', url: 'https://www.fitsynergy.nl/', sort: 2 },
];
