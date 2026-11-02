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
