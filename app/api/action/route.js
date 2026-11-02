// Alle acties van leden. Geen account nodig: een apparaat-id + naam, net als op de website.
import { all, insert, upsert, remove } from '@/lib/db';
import { buildState } from '@/lib/state';
import { withTrainings } from '@/lib/club';
import { sendPush } from '@/lib/push';

export const dynamic = 'force-dynamic';

const clean = (s, max = 80) => String(s ?? '').trim().slice(0, max);
const bad = (msg) => Response.json({ error: msg }, { status: 400 });

export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { return bad('Ongeldig verzoek.'); }
  const device = clean(b.device, 64);
  const name = clean(b.name);
  if (!device) return bad('Apparaat onbekend. Herlaad de app.');

  try {
    switch (b.action) {
      case 'participate': {
        const events = withTrainings(await all('events'));
        const ev = events.find((e) => e.id === b.eventId);
        if (!ev) return bad('Dit evenement bestaat niet (meer).');
        if (b.on) {
          if (!name) return bad('Vul je naam in.');
          if (ev.capacity) {
            const n = (await all('participants')).filter((p) => p.event_id === ev.id && p.device_id !== device).length;
            if (n >= ev.capacity) return bad('Dit evenement zit vol.');
          }
          await upsert('participants', { event_id: ev.id, device_id: device, name }, ['event_id', 'device_id']);
        } else {
          await remove('participants', { event_id: ev.id, device_id: device });
        }
        break;
      }
      case 'offerRide': {
        if (!name) return bad('Vul eerst je naam in bij Meer.');
        const seats = Math.max(1, Math.min(8, parseInt(b.seats, 10) || 1));
        await insert('rides', { event_id: clean(b.eventId), device_id: device, driver: name, from_place: clean(b.from, 120) || 'Bennekom', depart_time: clean(b.time, 5) || '08:30', seats });
        await sendPush('carpool', { title: 'Nieuwe rit in de carpool', body: `${name} heeft ${seats} ${seats === 1 ? 'plek' : 'plekken'} vrij.`, url: '/event/' + clean(b.eventId) }, device);
        break;
      }
      case 'cancelRide': {
        const ride = (await all('rides')).find((r) => r.id === b.rideId);
        if (!ride || ride.device_id !== device) return bad('Deze rit is niet van jou.');
        await remove('ride_passengers', { ride_id: ride.id });
        await remove('rides', { id: ride.id });
        break;
      }
      case 'joinRide': {
        const ride = (await all('rides')).find((r) => r.id === b.rideId);
        if (!ride) return bad('Deze rit bestaat niet meer.');
        if (b.on) {
          if (!name) return bad('Vul eerst je naam in bij Meer.');
          const pax = (await all('ride_passengers')).filter((p) => p.ride_id === ride.id && p.device_id !== device);
          if (pax.length >= ride.seats) return bad('Deze auto is vol.');
          await upsert('ride_passengers', { ride_id: ride.id, device_id: device, name }, ['ride_id', 'device_id']);
          await sendPush('carpool', { title: 'Iemand rijdt met je mee', body: `${name} rijdt mee naar je rit van ${ride.depart_time}.`, url: '/event/' + ride.event_id }, null, ride.device_id);
        } else {
          await remove('ride_passengers', { ride_id: ride.id, device_id: device });
        }
        break;
      }
      case 'addResult': {
        if (!name) return bad('Vul eerst je naam in bij Meer.');
        const seconds = parseInt(b.seconds, 10);
        if (!(seconds >= 600 && seconds <= 3600)) return bad('Vul een tijd tussen 10:00 en 60:00 in.');
        await insert('challenge_results', { device_id: device, name, edition: clean(b.edition, 20), seconds });
        break;
      }
      case 'deleteResult': {
        const r = (await all('challenge_results')).find((x) => x.id === b.id);
        if (!r || r.device_id !== device) return bad('Deze tijd is niet van jou.');
        await remove('challenge_results', { id: r.id });
        break;
      }
      case 'suggest': {
        if (!clean(b.title)) return bad('Geef de wedstrijd een naam.');
        await insert('suggestions', { name: clean(b.title), date: b.date || null, place: clean(b.place), by_name: name });
        break;
      }
      case 'subscribe': {
        if (!b.subscription?.endpoint) return bad('Pushmeldingen worden niet ondersteund op dit apparaat.');
        await upsert('push_subscriptions', { endpoint: b.subscription.endpoint, device_id: device, subscription: b.subscription, prefs: b.prefs || {}, updated_at: new Date().toISOString() }, ['endpoint']);
        return Response.json({ ok: true });
      }
      case 'unsubscribe': {
        if (b.endpoint) await remove('push_subscriptions', { endpoint: b.endpoint });
        return Response.json({ ok: true });
      }
      default:
        return bad('Onbekende actie.');
    }
    return Response.json(await buildState(device));
  } catch (e) {
    return Response.json({ error: 'Opslaan lukte niet. Probeer het nog eens.' }, { status: 500 });
  }
}
