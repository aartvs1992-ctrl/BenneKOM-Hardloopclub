// Tempo's (uitleg op /tempo) en de intervaltrainingen per dinsdag.
export const ZONES = {
  rustig: {
    name: 'Rustig / duurloop', short: 'Rustig', level: 1,
    feel: 'Ontspannen. Je kunt gewoon hele zinnen praten en zou dit heel lang volhouden.',
    rpe: '3–4 van 10',
    why: 'De basis van alles: je hart, longen en spieren worden efficiënter zonder dat je er kapot van gaat. Het grootste deel van je kilometers hoort hier.',
  },
  threshold: {
    name: 'Threshold (drempeltempo)', short: 'Threshold', level: 3,
    feel: 'Comfortabel zwaar. Je ademt diep en regelmatig, praten gaat nog in korte zinnen. Aan het eind van een blok denk je: ik kan er nog wel één.',
    rpe: '6–7 van 10',
    why: 'Rond je drempel maakt je lichaam ongeveer net zo snel melkzuur aan als het kan opruimen. Wie hier vaak en gecontroleerd traint, kan een hoger tempo langer volhouden. Ongeveer het tempo dat je een uur volhoudt in een wedstrijd, bij de meeste lopers iets langzamer dan hun 10 km-tempo.',
    tip: 'Liever iets te rustig dan te snel. Begin je te hijgen of verkrampt je, dan zit je erboven. Elk blok even snel is het doel, niet het snelste blok.',
  },
  zevenheuvelen: {
    name: 'Zevenheuvelen-tempo (15 km)', short: '15 km-tempo', level: 4,
    feel: 'Het tempo dat je op de Zevenheuvelenloop wilt lopen. Pittig maar gecontroleerd, alleen nog losse woorden.',
    rpe: '7–8 van 10',
    why: 'In de laatste week voor een wedstrijd laat je je benen nog één keer het racetempo voelen, zodat het op de dag zelf vertrouwd aanvoelt. Kort genoeg om fris aan de start te staan.',
  },
  hard: {
    name: 'Hard (kort en snel)', short: 'Hard', level: 5,
    feel: 'Snel, sneller dan je 5 km-tempo. Praten gaat niet meer. Omdat de stukken kort zijn, blijft het vol te houden.',
    rpe: '8–9 van 10',
    why: 'Korte, snelle stukken maken je loopstijl soepel en je benen sneller. Met korte rust blijft je hartslag hoog, zodat ook je conditie een flinke prikkel krijgt.',
  },
};

// Per interval-dinsdag: de sets. workMin/restMin zijn alleen voor de grafiek (geschatte minuten).
export const WORKOUTS = {
  '2026-11-10': {
    title: '5 × 1 km + 10 min 45/15',
    intro: 'De laatste training voor de Zevenheuvelenloop, die veel van ons lopen. We doen dus niet te gek: scherp blijven, niet leeg trekken.',
    warm: 'Samen inlopen', cool: 'Samen uitlopen', warmNote: 'afstand volgt',
    sets: [
      { reps: 5, work: '1 km', zone: 'zevenheuvelen', rest: '90 sec rust', workMin: 4.5, restMin: 1.5 },
      { reps: 10, work: '45 sec hard', zone: 'hard', rest: '15 sec wandelen', workMin: 0.75, restMin: 0.25, label: '10 min 45/15', note: '15 seconden wandelen is echt heel kort. Zeker de laatste gaan pittig zijn.' },
    ],
  },
  '2026-11-24': {
    title: '5 × 5 min threshold',
    intro: 'Vijf blokken van vijf minuten op drempeltempo, met een minuut rust. Gecontroleerd lopen, zoals de Noorse methode het voordoet: elk blok even snel.',
    warm: 'Samen inlopen', cool: 'Samen uitlopen',
    sets: [
      { reps: 5, work: '5 min', zone: 'threshold', rest: '60 sec rust', workMin: 5, restMin: 1 },
    ],
  },
};

export const workoutFor = (iso) => WORKOUTS[iso] || null;
