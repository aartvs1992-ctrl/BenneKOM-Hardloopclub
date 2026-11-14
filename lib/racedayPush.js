// Meldingen rond wedstrijden waar BenneKOM'ers meedoen ("Ik doe mee" in de app).
// morning: op de racedag succes voor de lopers, en "moedig aan" voor de rest van de club.
// evening: de dag ervoor succes voor de lopers, en na afloop een vraag om beelden te delen.
import { sendPush, sendPushToDevices } from './push';
import { raceDay, shareUrl, afterHour } from './raceday';

export async function raceDayPushes(slot, { events, participants, today, tomorrow }) {
  const out = [];
  const races = events.filter((e) => e.type === 'wedstrijd');
  const who = (e) => participants.filter((p) => p.event_id === e.id);

  if (slot === 'morning') {
    for (const e of races.filter((x) => x.date === today)) {
      const ps = who(e);
      if (!ps.length) continue;
      const t = raceDay(e);
      const devices = new Set(ps.map((p) => p.device_id));
      const r1 = await sendPushToDevices([...devices], {
        title: `Vandaag: ${e.title} 💪`,
        body: t.good,
        url: '/',
      });
      const n = ps.length;
      const r2 = await sendPush('aanmoedigen', {
        title: `${n} ${n === 1 ? 'BenneKOM\'er loopt' : 'BenneKOM\'ers lopen'} vandaag de ${e.title}`,
        body: `${t.cheer} Sta je langs de kant? Deel je gave beelden in de app 📸`,
        url: '/',
      }, devices);
      out.push({ race: e.id, runners: r1.reached?.size ?? 0, cheer: r2.sent ?? r2.skipped });
    }
  }

  if (slot === 'evening') {
    for (const e of races.filter((x) => x.date === tomorrow)) {
      const ps = who(e);
      if (!ps.length) continue;
      const t = raceDay(e);
      const r = await sendPushToDevices(ps.map((p) => p.device_id), {
        title: `Morgen: ${e.title}`,
        body: t.good.replace(/^Succes[^!]*!/, 'Succes morgen!'),
        url: '/event/' + e.id,
      });
      out.push({ race: e.id, eve: r.reached?.size ?? 0 });
    }
    // De evening-cron draait rond 16:00; avondwedstrijden zijn dan nog niet gelopen
    for (const e of races.filter((x) => x.date === today && afterHour(x) <= 16)) {
      const ps = who(e);
      if (!ps.length) continue;
      const t = raceDay(e);
      const r = await sendPushToDevices(ps.map((p) => p.device_id), {
        title: `${e.title}: hoe ging het?`,
        body: t.after,
        url: shareUrl(e),
      });
      out.push({ race: e.id, after: r.reached?.size ?? 0 });
    }
  }
  return out;
}
