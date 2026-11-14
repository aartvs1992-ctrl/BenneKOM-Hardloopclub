// Dagelijks aangeroepen door Vercel Cron (zie vercel.json).
// Stuurt op trainingsdagen een herinnering, de dag voor een 5km Challenge een seintje,
// en een week en een dag voor een inschrijfdeadline een melding.
import { all } from '@/lib/db';
import { withTrainings, todayISO } from '@/lib/club';
import { sendPush } from '@/lib/push';
import { raceDayPushes } from '@/lib/racedayPush';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Niet toegestaan.' }, { status: 401 });
  }
  const today = todayISO();
  const tomorrow = todayISO(new Date(Date.now() + 864e5));
  const [events, participants] = await Promise.all([all('events'), all('participants')]);
  const list = withTrainings(events, today);
  const out = [];

  const training = list.find((e) => e.date === today && (e.type === 'training' || e.replaces_training));
  if (training) {
    const n = participants.filter((p) => p.event_id === training.id).length;
    out.push(await sendPush('training', {
      title: `Vanavond ${training.time} · ${training.title}`,
      body: `${n} ${n === 1 ? 'loper komt' : 'lopers komen'}. Ben jij erbij?`,
      url: '/event/' + training.id,
    }));
  }

  const chal = list.find((e) => e.date === tomorrow && e.type === 'challenge');
  if (chal) {
    out.push(await sendPush('challenge', {
      title: 'Morgen: BenneKOM 5km Challenge',
      body: `Start ${chal.time || '10:00'} bij ${chal.place}. Schrijf je in in de app.`,
      url: '/event/' + chal.id,
    }));
  }
  // BenneKOM-specials: de dag ervoor een herinnering
  for (const e of list.filter((x) => x.date === tomorrow && x.type === 'special')) {
    out.push(await sendPush('events', {
      title: `Morgen: ${e.title}`,
      body: `${e.time ? e.time + ' · ' : ''}${(e.place || '').split(',')[0] || 'Bennekom'}. Ben jij erbij?`,
      url: '/event/' + e.id,
    }));
  }

  // Inschrijfdeadlines: een week en een dag van tevoren
  const inWeek = todayISO(new Date(Date.now() + 7 * 864e5));
  for (const e of list) {
    const dl = e.details?.deadline;
    if (!dl || e.type === 'training') continue;
    const day = new Date(dl + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Amsterdam' });
    if (dl === tomorrow) out.push(await sendPush('deadlines', { title: `Morgen sluit de inschrijving: ${e.title}`, body: `Inschrijven kan tot en met ${day}.`, url: '/event/' + e.id }));
    else if (dl === inWeek) out.push(await sendPush('deadlines', { title: `Nog een week om in te schrijven: ${e.title}`, body: `De inschrijving sluit ${day}.`, url: '/event/' + e.id }));
  }
  // Racedag: succes voor wie morgen loopt, en "hoe ging het?" voor wie vandaag liep
  out.push(...await raceDayPushes('evening', { events, participants, today, tomorrow }));
  return Response.json({ today, results: out });
}
