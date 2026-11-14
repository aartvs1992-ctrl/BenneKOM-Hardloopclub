// Ochtend-cron (zie vercel.json, rond 08:00/09:00 NL-tijd).
// Op de dag van een wedstrijd waar BenneKOM'ers meedoen: succes voor de lopers, aanmoedigen voor de rest.
import { all } from '@/lib/db';
import { todayISO } from '@/lib/club';
import { raceDayPushes } from '@/lib/racedayPush';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Niet toegestaan.' }, { status: 401 });
  }
  const today = todayISO();
  const [events, participants] = await Promise.all([all('events'), all('participants')]);
  const results = await raceDayPushes('morning', { events, participants, today });
  return Response.json({ today, results });
}
