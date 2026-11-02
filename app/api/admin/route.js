// Beheer: events, nieuws, voorstellen en handmatige pushmeldingen. Beveiligd met ADMIN_PASSWORD.
import { all, insert, upsert, remove, usingSupabase, deleteFile } from '@/lib/db';
import { listPhotos } from '@/lib/photos';
import { withTrainings } from '@/lib/club';
import { sendPush, pushReady } from '@/lib/push';

export const dynamic = 'force-dynamic';

const clean = (s, max = 200) => String(s ?? '').trim().slice(0, max);
const slug = (s) => clean(s, 60).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return Response.json({ error: 'Stel eerst ADMIN_PASSWORD in bij Vercel.' }, { status: 403 });
  if (b.password !== pw) return Response.json({ error: 'Wachtwoord klopt niet.' }, { status: 401 });

  try {
    switch (b.action) {
      case 'load':
        break;
      case 'saveEvent': {
        const e = b.event || {};
        if (!clean(e.title) || !/^\d{4}-\d{2}-\d{2}$/.test(e.date || '')) return Response.json({ error: 'Titel en datum zijn verplicht.' }, { status: 400 });
        const row = {
          id: e.id || `${slug(e.title)}-${e.date}`,
          type: ['special', 'wedstrijd', 'challenge', 'training'].includes(e.type) ? e.type : 'special',
          title: clean(e.title, 100), date: e.date, time: clean(e.time, 5), place: clean(e.place, 120),
          description: clean(e.description, 1000), distances: clean(e.distances, 120),
          capacity: e.capacity ? parseInt(e.capacity, 10) : null,
          registration: !!e.registration, carpool: !!e.carpool, replaces_training: !!e.replaces_training,
          url: /^https?:\/\//.test(e.url || '') ? clean(e.url, 300) : '',
        };
        await upsert('events', row, ['id']);
        if (b.notify) await sendPush('events', { title: 'Nieuw in de agenda', body: `${row.title} · ${row.date.split('-').reverse().join('-')}`, url: '/event/' + row.id });
        break;
      }
      case 'deleteEvent':
        await remove('events', { id: clean(b.id) });
        await remove('participants', { event_id: clean(b.id) });
        break;
      case 'saveNews': {
        const n = b.news || {};
        if (!clean(n.title)) return Response.json({ error: 'Een bericht heeft een titel nodig.' }, { status: 400 });
        await insert('news', { author: clean(n.author, 40) || 'Bestuur', title: clean(n.title, 120), body: clean(n.body, 4000), event_id: n.event_id || null, published_at: new Date().toISOString().slice(0, 10) });
        break;
      }
      case 'deleteNews':
        await remove('news', { id: b.id });
        break;
      case 'deleteSuggestion':
        await remove('suggestions', { id: b.id });
        break;
      case 'addParticipants': {
        // namen overnemen (bijv. van een Strava-event); één naam per regel
        const ev = clean(b.eventId, 80);
        if (!ev) return Response.json({ error: 'Kies een evenement.' }, { status: 400 });
        const existing = new Set((await all('participants')).filter((p) => p.event_id === ev).map((p) => p.name.toLowerCase()));
        const names = String(b.names || '').split(/\n|,/).map((n) => clean(n, 80)).filter(Boolean);
        let added = 0;
        for (const name of names) {
          if (existing.has(name.toLowerCase())) continue;
          existing.add(name.toLowerCase());
          await upsert('participants', { event_id: ev, device_id: 'beheer-' + slug(name), name }, ['event_id', 'device_id']);
          added++;
        }
        if (!names.length) return Response.json({ error: 'Vul minstens één naam in.' }, { status: 400 });
        b.added = added;
        break;
      }
      case 'removeParticipant':
        await remove('participants', { event_id: clean(b.eventId, 80), device_id: clean(b.device, 80) });
        break;
      case 'saveMedia': {
        const m = b.media || {};
        if (!clean(m.outlet) || !clean(m.title)) return Response.json({ error: 'Vul het medium en de titel in.' }, { status: 400 });
        await insert('media', { outlet: clean(m.outlet, 60), title: clean(m.title, 160), published: /^\d{4}-\d{2}$/.test(m.published || '') ? m.published : '', url: /^https?:\/\//.test(m.url || '') ? clean(m.url, 400) : '', summary: clean(m.summary, 400) });
        break;
      }
      case 'deleteMedia':
        await remove('media', { id: b.id });
        break;
      case 'deleteResult':
        await remove('challenge_results', { id: b.id });
        break;
      case 'deletePhoto': {
        const p = (await all('photos')).find((x) => x.id === b.id);
        if (p) { await remove('photo_likes', { photo_id: p.id }); await remove('photos', { id: p.id }); await deleteFile(p.path); }
        break;
      }
      case 'featurePhoto': {
        const p = (await all('photos')).find((x) => x.id === b.id);
        if (p) await upsert('photos', { ...p, featured: !p.featured }, ['id']);
        break;
      }
      case 'push': {
        if (!clean(b.title)) return Response.json({ error: 'Geef de melding een titel.' }, { status: 400 });
        const r = await sendPush(b.pref || 'events', { title: clean(b.title, 80), body: clean(b.body, 200), url: b.url || '/' });
        return Response.json({ pushed: r });
      }
      default:
        return Response.json({ error: 'Onbekende actie.' }, { status: 400 });
    }
    const [events, news, suggestions, participants, results, subs, photos] = await Promise.all([
      all('events'), all('news'), all('suggestions'), all('participants'), all('challenge_results'), all('push_subscriptions'), listPhotos(''),
    ]);
    return Response.json({
      events: events.sort((a, b) => a.date.localeCompare(b.date)),
      news: news.sort((a, b) => String(b.published_at).localeCompare(String(a.published_at))),
      suggestions, participants, results, photos,
      subscribers: subs.length,
      media: await all('media').catch(() => []),
      upcoming: withTrainings(events).map((e) => ({ id: e.id, title: e.title, date: e.date, type: e.type })),
      added: b.added,
      status: { database: usingSupabase, push: pushReady },
    });
  } catch (e) {
    return Response.json({ error: 'Er ging iets mis: ' + e.message }, { status: 500 });
  }
}
