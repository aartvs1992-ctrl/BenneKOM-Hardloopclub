// Tempo's (uitleg op /tools, Training & tempo) en de intervaltrainingen per dinsdag.
export const ZONES = {
  rustig: {
    summary: 'Ontspannen tempo waarop je hele zinnen kunt praten.',
    name: 'Rustig / duurloop', short: 'Rustig', level: 1,
    feel: 'Ontspannen. Je kunt gewoon hele zinnen praten en zou dit heel lang volhouden.',
    rpe: '3–4 van 10',
    why: 'De basis van alles: je hart, longen en spieren worden efficiënter zonder dat je er kapot van gaat. Het grootste deel van je kilometers hoort hier.',
  },
  threshold: {
    summary: 'Threshold is het tempo rond je omslagpunt: comfortabel zwaar, praten gaat nog in korte zinnen. We lopen het vooral bij korte intervallen van 1 tot 3 minuten. Liever iets te rustig dan te snel.',
    name: 'Threshold (drempeltempo)', short: 'Threshold', level: 3,
    feel: 'Comfortabel zwaar. Je ademt diep en regelmatig, praten gaat nog in korte zinnen. Aan het eind van een blok denk je: ik kan er nog wel één.',
    rpe: '6–7 van 10',
    when: 'Vooral bij korte intervallen van 1 tot 3 minuten, bijvoorbeeld 10 × 1000 m of 15 × 2 min met korte rust.',
    why: 'Rond je drempel maakt je lichaam ongeveer net zo snel melkzuur aan als het kan opruimen. Wie hier vaak en gecontroleerd traint, kan een hoger tempo langer volhouden. Het is ongeveer het tempo dat je 40 tot 60 minuten volhoudt in een wedstrijd, afhankelijk van je niveau: hoe beter getraind, hoe dichter bij 60 minuten.',
    tip: 'Liever iets te rustig dan te snel. Begin je te hijgen of verkrampt je, dan zit je erboven. Elk blok even snel is het doel, niet het snelste blok.',
    photo: { src: '/club/tempo-ingebrigtsen.jpg', caption: 'Jakob Ingebrigtsen, het gezicht van de Noorse school' },
    norway: 'Deze intensiteit komt voor een groot deel uit de Noorse school, bekend geworden door Jakob Ingebrigtsen en zijn broers. Omdat threshold relatief comfortabel is, herstel je er snel van. Daardoor kun je meerdere keren per week rond deze intensiteit trainen; de Noren doen soms zelfs twee sessies op één dag (double threshold). Bij VO2max-trainingen gaat dat niet: die zijn zwaarder en daar moet je langer van herstellen. Zo bouw je met threshold veel kwaliteit op zonder uitgeput te raken.',
  },
  subthreshold: {
    summary: 'Sub-threshold ligt net onder je drempel, meestal zo’n 5 tot 10 seconden per km rustiger dan threshold. We lopen het bij langere blokken van 5 tot 10 minuten.',
    name: 'Sub-threshold (net onder de drempel)', short: 'Sub-threshold', level: 2.6,
    feel: 'Stevig maar beheerst. Je ademhaling is diep en rustig, praten gaat nog in zinnen. Het voelt makkelijker dan threshold, en zo hoort het ook.',
    rpe: '5–6 van 10',
    when: 'Bij langere blokken van 5 tot 10 minuten, bijvoorbeeld 5 × 5 min, 4 × 8 min of 3 × 10 min met korte rust.',
    why: 'Net onder de drempel bouw je veel tijd op een stevig tempo op, terwijl je lichaam het melkzuur nog goed kan opruimen. Daardoor herstel je snel en kun je dit vaak doen. Dit is de kern van de Noorse aanpak: veel volume net onder de drempel, in plaats van vaak heel hard.',
    tip: 'Ga je bij het laatste blok toch harder? Dan liep je de eerste te snel. Elk blok even snel, en houd er eentje over.',
  },
  zevenheuvelen: {
    summary: 'Het tempo dat je op de Zevenheuvelenloop (15 km) wilt lopen: pittig maar gecontroleerd, zodat het op de dag zelf vertrouwd voelt.',
    name: 'Zevenheuvelen-tempo (15 km)', short: '15 km-tempo', level: 4, hidden: true,
    feel: 'Het tempo dat je op de Zevenheuvelenloop wilt lopen. Pittig maar gecontroleerd, alleen nog losse woorden.',
    rpe: '7–8 van 10',
    why: 'In de laatste week voor een wedstrijd laat je je benen nog één keer het racetempo voelen, zodat het op de dag zelf vertrouwd aanvoelt. Kort genoeg om fris aan de start te staan.',
  },
  vo2max: {
    summary: 'VO2max is zwaar: je hijgt flink en kunt alleen nog een paar woorden zeggen. Blokken van 2 tot 5 minuten, op het tempo dat je zo’n 12 tot 18 minuten zou volhouden. Je eigen tempo staat bij Training & tempo.',
    name: 'VO2max', short: 'VO2max', level: 4.5,
    feel: 'Zwaar. Je ademt snel en diep, praten lukt alleen nog in een paar woorden. Aan het eind van een blok ben je blij dat de rust komt.',
    rpe: '8–9 van 10',
    why: 'VO2max is de hoeveelheid zuurstof die je lichaam maximaal kan opnemen en gebruiken: je motor. Blokken van 2 tot 5 minuten op het tempo dat je zo’n 12 tot 18 minuten zou volhouden, met ongeveer even lange rust, maken die motor groter. Anders dan bij threshold heb je hier langer herstel nodig. Doe het daarom niet wekelijks, maar af en toe, bijvoorbeeld in de weken richting een wedstrijd.',
    tip: 'Het eerste blok voelt vaak makkelijk. Begin dus niet te snel, anders zijn de laatste blokken een gevecht.',
  },
  hard: {
    summary: 'Korte stukken sneller dan je 5 km-tempo. Praten gaat niet meer, maar door de korte duur blijft het vol te houden.',
    name: 'Hard (kort en snel)', short: 'Hard', level: 5, hidden: true,
    feel: 'Snel, sneller dan je 5 km-tempo. Praten gaat niet meer. Omdat de stukken kort zijn, blijft het vol te houden.',
    rpe: '8–9 van 10',
    why: 'Korte, snelle stukken maken je loopstijl soepel en je benen sneller. Met korte rust blijft je hartslag hoog, zodat ook je conditie een flinke prikkel krijgt.',
  },
  strides: {
    summary: 'Strides zijn korte versnellingen van zo’n 80–100 meter: soepel opbouwen naar snel, nooit voluit. Goed voor je loopstijl.',
    name: 'Strides (versnellingen)', short: 'Strides', level: 4, extra: true,
    feel: 'Snel maar ontspannen. Je bouwt in 15 tot 20 seconden op naar ongeveer je 1 km-tempo, met losse schouders en een hoge pas. Je wordt er niet moe van.',
    rpe: '6–7 van 10 (kort)',
    why: 'Strides leren je benen om snel en soepel te bewegen, zonder dat het veel vermoeidheid kost. Ideaal na een rustige duurloop of als laatste stuk van de warming-up voor een interval of wedstrijd.',
    tip: 'Tussen de strides wandel of dribbel je rustig terug tot je ademhaling weer normaal is. Meestal 4 tot 6 keer.',
  },
  fartlek: {
    summary: 'Fartlek is Zweeds voor ‘snelheidsspel’: speels wisselen tussen hard en rustig, op gevoel of tot de volgende lantaarnpaal.',
    name: 'Fartlek (speelse intervallen)', short: 'Fartlek', level: 3.5, extra: true,
    feel: 'Afwisselend: stukken op tempo of hard, daarna rustig doorlopen. Geen vaste afstanden of tijden nodig, je laat de omgeving bepalen.',
    rpe: '4–8 van 10, wisselend',
    why: 'Fartlek traint je om van tempo te wisselen, zoals in een wedstrijd. Omdat het speels is, voelt een zware training minder zwaar, en in een groep kun je elkaar mooi uitdagen.',
    tip: 'Kies samen herkenningspunten: hard tot de bocht, rustig tot de brug. Wie wil, mag harder; wie wil, houdt het rustiger.',
  },
};

// Per interval-dinsdag: de sets. workMin/restMin zijn alleen voor de grafiek (geschatte minuten).
export const WORKOUTS = {
  '2026-11-10': {
    title: '5 × 1 km + 10 min 45/15',
    intro: 'De laatste training voor de Zevenheuvelenloop, die veel van ons lopen. We doen dus niet te gek: scherp blijven, niet leeg trekken.',
    warm: 'Samen inlopen', cool: 'Samen uitlopen', warmNote: 'afstand volgt',
    sets: [
      { reps: 5, work: '1 km', zone: 'threshold', rest: '90 sec rust', workMin: 4.5, restMin: 1.5 },
      { reps: 10, work: '45 sec hard', zone: 'hard', rest: '15 sec wandelen', workMin: 0.75, restMin: 0.25, label: '10 min 45/15', note: '15 seconden wandelen is echt heel kort. Zeker de laatste gaan pittig zijn.' },
    ],
  },
  '2026-11-24': {
    title: '5 × 5 min sub-threshold',
    intro: 'Vijf blokken van vijf minuten net onder de drempel, met een minuut rust. Gecontroleerd lopen, zoals de Noorse methode het voordoet: elk blok even snel.',
    warm: 'Samen inlopen', cool: 'Samen uitlopen',
    sets: [
      { reps: 5, work: '5 min', zone: 'subthreshold', rest: '60 sec rust', workMin: 5, restMin: 1 },
    ],
  },
};

export const workoutFor = (iso) => WORKOUTS[iso] || null;
