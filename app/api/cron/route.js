// Dagelijks aangeroepen door Vercel Cron (zie vercel.json).
// Stuurt op trainingsdagen een herinnering en de dag voor een 5km Challenge een seintje.
import { all } from '@/lib/db';
import { withTrainings, todayISO } from '@/lib/club';
import { sendPush } from '@/lib/push';

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
  return Response.json({ today, results: out });
}
