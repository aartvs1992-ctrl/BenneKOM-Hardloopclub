import { all } from './db';
import { withTrainings } from './club';
import { profileMap } from './profiles';
import { kmFromBennekom } from './races';
import { DEFAULT_DETAILS } from './seed';
import { CHALLENGE_DETAILS } from './challenge';

// Alles wat de app nodig heeft in één keer, toegespitst op dit apparaat
export async function buildState(device) {
  const [events, participants, rides, passengers, results, news, profiles] = await Promise.all([
    all('events'), all('participants'), all('rides'), all('ride_passengers'), all('challenge_results'), all('news'), profileMap(),
  ]);
  // naam + profielfoto per persoon; zonder profiel de naam die bij aanmelden is ingevuld
  const person = (deviceId, fallback) => ({
    ...(profiles[deviceId] || {}),
    name: profiles[deviceId]?.name || fallback,
    avatar: profiles[deviceId]?.avatar || null,
    me: deviceId === device,
  });

  const list = withTrainings(events).map((e) => {
    if (e.type === 'wedstrijd') return { ...e, km: kmFromBennekom(e.place) };
    if (e.type === 'samenloop') {
      const { by, by_name, ...rest } = e.details || {};
      return { ...e, details: rest, organizer: person(by, by_name), own: by === device };
    }
    const base = DEFAULT_DETAILS[e.id] || (e.type === 'challenge' ? CHALLENGE_DETAILS : null);
    if (!base) return e;
    // eigen invulling uit Beheer gaat voor; lege velden aanvullen met de standaard
    const own = e.details || {};
    const merged = { ...base };
    for (const [k, v] of Object.entries(own)) if (v) merged[k] = v;
    return { ...e, details: merged };
  });
  const media = await all('media').catch(() => []);
  const shirtRows = await all('shirt_interest').catch(() => []);
  const partners = await all('partners').catch(() => []);
  const ids = new Set(list.map((e) => e.id));

  const counts = {};
  const names = {};
  const mine = {};
  for (const p of participants) {
    if (!ids.has(p.event_id)) continue;
    counts[p.event_id] = (counts[p.event_id] || 0) + 1;
    (names[p.event_id] ||= []).push(person(p.device_id, p.name));
    if (p.device_id === device) mine[p.event_id] = profiles[device]?.name || p.name;
  }

  const rideMap = {};
  for (const r of rides) {
    if (!ids.has(r.event_id)) continue;
    const pax = passengers.filter((p) => p.ride_id === r.id);
    (rideMap[r.event_id] ||= []).push({
      id: r.id, driver: person(r.device_id, r.driver), from: r.from_place, time: r.depart_time, seats: r.seats,
      passengers: pax.map((p) => person(p.device_id, p.name)),
      left: r.seats - pax.length,
      mine: r.device_id === device,
      joined: pax.some((p) => p.device_id === device),
    });
  }

  return {
    me: profiles[device] || null,
    // kortingscodes alleen voor leden die zich hebben aangemeld
    partners: partners.sort((a, b) => (a.sort || 0) - (b.sort || 0)).map((p) => (profiles[device] ? p : { ...p, code: '', locked: Boolean(p.code) })),
    media: media.sort((a, b) => String(b.published || '').localeCompare(String(a.published || ''))),
    events: list,
    counts,
    names,
    mine,
    shirts: shirtRows.filter((r) => r.device_id === device).map((r) => ({ item: r.item, size: r.size, qty: r.qty })),
    shirtCount: shirtRows.reduce((n, r) => n + (r.qty || 1), 0),
    shirtPeople: ['kort', 'lang'].reduce((o, it) => ({ ...o, [it]: shirtRows.filter((r) => r.item === it).map((r) => person(r.device_id, r.name)) }), {}),
    rides: rideMap,
    results: results
      .filter((r) => r.device_id === device)
      .map((r) => ({ id: r.id, name: r.name, edition: r.edition, seconds: r.seconds, date: r.created_at, mine: true }))
      .sort((a, b) => a.seconds - b.seconds),
    news: news.sort((a, b) => String(b.published_at).localeCompare(String(a.published_at))),
  };
}
