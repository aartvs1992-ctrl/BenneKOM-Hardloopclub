import { SEED_RACES } from './races';
// Zelfde startdata als supabase/schema.sql — gebruikt zolang er geen database gekoppeld is.
export const SEED_EVENTS_BASE = [
  { id: 'dorpsrun-renswoude', type: 'wedstrijd', title: 'Dorpsrun Renswoude', date: '2026-11-07', time: '', place: 'Renswoude', description: 'Race in de regio. De club gaat samen; regel je rit via de carpool.', distances: 'Kidsrun · 5 km · 10 km · 21,1 km', capacity: null, registration: false, carpool: true, replaces_training: false },
  { id: 'pasta-run', type: 'special', title: 'Run Pasta Run', date: '2026-11-17', time: '18:00', place: 'Dunantlaan 10–12, Bennekom', description: '8 tot 10 km samen lopen en daarna samen eten. Vervangt deze dinsdag de gewone training.', distances: '', capacity: null, registration: true, carpool: false, replaces_training: true },
  { id: 'challenge-2026-11', type: 'challenge', title: 'BenneKOM 5km Challenge', date: '2026-11-28', time: '10:00', place: 'Langschoterweg 7, Bennekom', description: 'Test jezelf op 5 km, loop samen of haas een ander naar een mooie tijd. Elke laatste zaterdag van de maand.', distances: '5 km', capacity: null, registration: true, carpool: false, replaces_training: false },
  { id: 'run-dip-run', type: 'special', title: 'Run-Dip-Run met Sportrusten', date: '2026-12-19', time: '', place: 'De Dorpsherberg, Bennekom', description: 'Toelichting over koudetraining door Koen de Jong van Sportrusten, dan een duurloop naar de Rijn met een dip halverwege en terug naar Bennekom.', distances: '5–10 km', capacity: 40, registration: true, carpool: false, replaces_training: false },
  { id: 'challenge-2026-12', type: 'challenge', title: 'BenneKOM 5km Challenge', date: '2026-12-26', time: '10:00', place: 'Langschoterweg 7, Bennekom', description: 'De laatste Challenge van het jaar.', distances: '5 km', capacity: null, registration: true, carpool: false, replaces_training: false },
];

export const SEED_NEWS = [
  { author: 'Bestuur', title: 'Run-Dip-Run in Bennekom', body: 'Samen met Sportrusten: uitleg over koudetraining, een rustig rondje en een duik in de Rijn.', event_id: 'run-dip-run', published_at: '2026-05-12' },
  { author: 'Wilco', title: 'Nieuwe website', body: 'De club heeft een nieuwe site met kalender, calculator, voeding en meer.', event_id: null, published_at: '2026-04-22' },
];

export const SEED_EVENTS = [...SEED_EVENTS_BASE, ...SEED_RACES];

export const SEED_MEDIA = [
  { outlet: 'Ede Stad', title: 'De groei van BenneKOM', published: '2025-11', url: '', summary: 'Over hoe de loopclub in Bennekom in korte tijd groeide.' },
  { outlet: 'De Gelderlander', title: 'Tweeling-ouders die samen op het podium staan', published: '', url: '', summary: 'Een ouderpaar van een tweeling dat maandelijks honderden kilometers loopt.' },
];
