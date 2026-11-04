// Alle acties van leden. Geen account nodig: een apparaat-id + naam, net als op de website.
import { all, insert, upsert, remove } from '@/lib/db';
import { buildState } from '@/lib/state';
import { withTrainings } from '@/lib/club';
import { sendPush } from '@/lib/push';
import { profileMap } from '@/lib/profiles';

export const dynamic = 'force-dynamic';

const clean = (s, max = 80) => String(s ?? '').trim().slice(0, max);
const bad = (msg) => Response.json({ error: msg }, { status: 400 });

export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { return bad('Ongeldig verzoek.'); }
  const device = clean(b.device, 64);
  if (!clean(b.device, 64)) return bad('Apparaat onbekend. Herlaad de app.');
  // heeft dit toestel een profiel, dan altijd die naam gebruiken
  const prof = (await profileMap())[clean(b.device, 64)];
  const name = prof?.name || clean(b.name);
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
          const already = (await all('participants')).some((p) => p.event_id === ev.id && p.device_id === device);
          await upsert('participants', { event_id: ev.id, device_id: device, name }, ['event_id', 'device_id']);
          // Melding aan de clubgenoten, niet bij gewone trainingen (dat zou te veel meldingen geven)
          if (!already && ev.type === 'samenloop' && ev.details?.by && ev.details.by !== device) {
            await sendPush('signups', { title: `${name.split(' ')[0]} loopt mee`, body: `${ev.title}, ${ev.date.split('-').reverse().join('-')} om ${ev.time}`, url: '/event/' + ev.id }, null, ev.details.by);
          } else if (!already && ev.type !== 'training') {
            const d = new Date(ev.date + 'T12:00:00');
            const when = d.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Amsterdam' });
            await sendPush('signups', { title: `${name.split(' ')[0]} doet mee aan ${ev.title}`, body: `${when}${ev.place ? ' · ' + ev.place.split(',')[0] : ''}. Ga je ook?`, url: '/event/' + ev.id }, device);
          }
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
      case 'shirt': {
        // interesse voor een clubshirt: aanvinken (met maat en aantal) of weer uitvinken
        const item = ['kort', 'lang'].includes(b.item) ? b.item : null;
        if (!item) return bad('Kies een shirt.');
        if (b.on === false) { await remove('shirt_interest', { device_id: device, item }); break; }
        const size = ['XS', 'S', 'M', 'L', 'XL', 'XXL'].includes(b.size) ? b.size : null;
        if (!size) return bad('Kies je maat.');
        if (!name) return bad('Vul eerst je naam in.');
        const qty = Math.min(5, Math.max(1, parseInt(b.qty, 10) || 1));
        await upsert('shirt_interest', { device_id: device, item, size, qty, name, updated_at: new Date().toISOString() }, ['device_id', 'item']);
        break;
      }
      case 'planRun': {
        if (!prof) return bad('Meld je eerst aan om een loopje te plannen.');
        const r = b.run || {};
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Amsterdam' });
        if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date || '') || r.date < today) return bad('Kies een datum vanaf vandaag.');
        if (r.date > new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10)) return bad('Plan een loopje hooguit drie maanden vooruit.');
        if (!/^([01]?\d|2[0-3]):[0-5]\d$/.test(r.time || '')) return bad('Vul een tijd in, bijvoorbeeld 09:00.');
        if (!clean(r.place)) return bad('Vul een startpunt in.');
        const km = parseFloat(String(r.km || '').replace(',', '.'));
        if (!(km >= 1 && km <= 60)) return bad('Vul een afstand in tussen 1 en 60 km.');
        const pace = clean(r.pace, 20);
        if (!pace) return bad('Vul een tempo in, bijvoorbeeld 5:30 of praattempo.');
        const route = /^https:\/\//.test(r.route || '') ? clean(r.route, 400) : '';
        const id = 'loop-' + r.date + '-' + Math.random().toString(36).slice(2, 8);
        const kmTxt = String(Math.round(km * 10) / 10).replace('.', ',') + ' km';
        const title = clean(r.title, 60) || 'Samen ' + kmTxt + ' lopen';
        await insert('events', {
          id, type: 'samenloop', title, date: r.date, time: r.time.padStart(5, '0'), place: clean(r.place, 120),
          description: clean(r.note, 400), distances: kmTxt, capacity: null, registration: false, carpool: false, replaces_training: false,
          details: { pace: /^\d{1,2}[:.]\d{2}$/.test(pace) ? pace.replace('.', ':') + '/km' : pace, route, by: device, by_name: name },
        });
        await upsert('participants', { event_id: id, device_id: device, name }, ['event_id', 'device_id']);
        const d = new Date(r.date + 'T12:00:00');
        const when = d.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Amsterdam' });
        await sendPush('samenloop', { title: `${name.split(' ')[0]} gaat ${kmTxt} lopen`, body: `${when} om ${r.time} · ${clean(r.place, 120).split(',')[0]}. Haak je aan?`, url: '/event/' + id }, device);
        break;
      }
      case 'cancelRun': {
        const ev = (await all('events')).find((e) => e.id === b.eventId && e.type === 'samenloop');
        if (!ev) return bad('Dit loopje bestaat niet (meer).');
        if (ev.details?.by !== device) return bad('Alleen de organisator kan dit loopje afzeggen.');
        const others = (await all('participants')).filter((p) => p.event_id === ev.id && p.device_id !== device);
        await remove('participants', { event_id: ev.id });
        await remove('events', { id: ev.id });
        for (const p of others) await sendPush('signups', { title: `${ev.title} gaat niet door`, body: `${name.split(' ')[0]} heeft het loopje afgezegd.`, url: '/agenda#samenloop' }, null, p.device_id);
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
    if (/events_type_check|violates check/.test(String(e.message))) return bad('Samen lopen is nog niet ingesteld: draai updates.sql in Supabase.', 500);
    if (/shirt_interest/.test(String(e.message))) return bad('Shirtbestellingen zijn nog niet ingesteld: draai updates.sql in Supabase.', 500);
    return Response.json({ error: 'Opslaan lukte niet. Probeer het nog eens.' }, { status: 500 });
  }
}
