// Racedag: aanmoedigen en succes wensen bij wedstrijden waar BenneKOM'ers meedoen.
// Op de dag zelf (en de dag ervoor/erna) staat er een kaart op de homepage, en de cron
// stuurt meldingen: 's ochtends succes aan de lopers en "moedig aan" aan de rest,
// na afloop een vraag om beelden te delen.
//
// Eigen teksten per wedstrijd zet je hieronder (gekoppeld op titel). Zonder eigen tekst
// gebruikt de app de algemene teksten. Een echte foto? Zet hem in public/club/ en vul `image` in.
import { raceInfo } from './raceinfo';

export const RACE_DAY = {
  Zevenheuvelenloop: {
    headline: 'Overwin die heuvels!',
    good: 'Succes! Zeven heuvels, één club achter je. Geniet ervan en geef alles 💪',
    cheer: 'Zie je onderweg een BenneKOM\'er? Moedig aan! 😀',
    after: 'Hoe waren de heuvels? Deel je mooiste beelden en je verhaal in de app.',
    hills: 7,
    image: '',
  },
  Zevenheuvelennacht: {
    headline: 'Knallen in het donker!',
    good: 'Succes vanavond! Lampje aan, heuvels op 💪',
    cheer: 'Zie je onderweg een BenneKOM\'er? Moedig aan! 😀',
    after: 'Hoe was de nacht? Deel je beelden in de app.',
    hills: 7,
    image: '',
  },
};

const GENERIC = {
  headline: 'Succes, BenneKOM\'ers!',
  good: 'Succes vandaag! Geniet ervan en geef alles 💪',
  cheer: 'Zie je onderweg een BenneKOM\'er? Moedig aan! 😀',
  after: 'Hoe ging het? Deel je mooiste beelden en je verhaal in de app.',
  hills: 3,
  image: '',
};

export const raceDay = (e) => ({ ...GENERIC, ...(RACE_DAY[e?.title] || {}) });

// Link naar de fotowall, met de wedstrijd alvast ingevuld bij het plaatsen
export const shareUrl = (e) => '/fotos?album=' + encodeURIComponent(e.title) + '&datum=' + e.date;

// Vanaf welk uur (NL-tijd) is de wedstrijd voorbij? Starttijd + 3 uur, anders 16:00.
export function afterHour(e) {
  const m = /^(\d{1,2})[:.]/.exec(e?.time || raceInfo(e?.title)?.time || '');
  return m ? Math.min(23, Number(m[1]) + 3) : 16;
}
