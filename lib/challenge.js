// Vaste informatie en foto's van de BenneKOM 5km Challenge
export const CHALLENGE_PHOTOS = [
  { src: '/club/challenge-groepsfoto.jpg', caption: 'Iedereen op de foto na de Challenge' },
  { src: '/club/challenge-uitleg.jpg', caption: 'Uitleg voor de start' },
  { src: '/club/challenge-herfstlaan.jpg', caption: 'Samen door de herfstlaan' },
  { src: '/club/challenge-onderdoorgang.jpg', caption: 'De hele groep onderweg' },
  { src: '/club/challenge-samen-hazen.jpg', caption: 'Samen tempo maken' },
  { src: '/club/challenge-duimen.jpg', caption: 'Duimen omhoog' },
  { src: '/club/challenge-lach.jpg', caption: 'Met een lach over de streep' },
  { src: '/club/challenge-verzamelen.jpg', caption: 'Bijpraten na afloop' },
];

export const CHALLENGE_EASY = {
  title: 'Geen PR nodig om mee te doen',
  text: 'De Challenge draait niet altijd om een PR. Heb je geen zin in een all-out effort? Kom dan gewoon, loop lekker wat rustiger en geniet van de gezelligheid. Of haas iemand anders naar een mooie tijd: daar maak je die ander heel blij mee.',
};

export const CHALLENGE_DETAILS = {
  image: '/club/challenge-start.jpg',
  story: 'Elke laatste zaterdag van de maand lopen we samen 5 km op hetzelfde Strava-segment. Je loopt tegen jezelf: ben je sneller dan de vorige keer? Koppel Strava in de app, dan zie je je tijden en je PR vanzelf.',
  program: '',
  bring: '',
  cost: '',
  host: null,
  gallery: CHALLENGE_PHOTOS.map((p) => p.src),
};
