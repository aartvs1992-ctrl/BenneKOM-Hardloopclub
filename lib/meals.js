// Maaltijdkeuze bij inschrijving (bv. de Pasta Run: vlees, vis of vega + eigen opmerking).
// Opslag: kolommen participants.meal en participants.meal_note (supabase/022_maaltijdkeuze.sql).
// Zolang die kolommen er nog niet zijn, bewaren we de keuze in events.details.meal_choices,
// zodat er niets verloren gaat. Bij het lezen worden beide bronnen samengevoegd.
import { find, update, upsert } from './db';
import { DEFAULT_DETAILS } from './seed';

// Welke keuzes een event heeft (leeg = geen maaltijdkeuze)
export function mealOptions(ev) {
  return ev?.details?.meals || DEFAULT_DETAILS[ev?.id]?.meals || [];
}

// Bedrag dat leden via de app betalen (leeg = geen betaalknop)
export function eventPrice(ev) {
  return Number(ev?.details?.price || DEFAULT_DETAILS[ev?.id]?.price || 0);
}

const missingColumn = (err) => /meal/i.test(String(err?.message || err)) && /column|schema/i.test(String(err?.message || err));

// Inschrijving opslaan mét keuze
export async function saveParticipant(ev, device, name, meal, note) {
  const row = { event_id: ev.id, device_id: device, name };
  if (!meal) return upsert('participants', row, ['event_id', 'device_id']);
  try {
    await upsert('participants', { ...row, meal, meal_note: note || '' }, ['event_id', 'device_id']);
    await setFallback(ev.id, device, null); // eventuele oude tijdelijke opslag opruimen
  } catch (err) {
    if (!missingColumn(err)) throw err;
    await upsert('participants', row, ['event_id', 'device_id']);
    await setFallback(ev.id, device, { meal, note: note || '' });
  }
}

// Bij uitschrijven ook de tijdelijke keuze weghalen
export async function clearMeal(eventId, device) {
  await setFallback(eventId, device, null).catch(() => {});
}

async function setFallback(eventId, device, value) {
  const [row] = await find('events', { id: eventId });
  if (!row) return;
  const details = { ...(row.details || {}) };
  const choices = { ...(details.meal_choices || {}) };
  if (value) choices[device] = value;
  else if (choices[device]) delete choices[device];
  else return; // niets te doen
  details.meal_choices = choices;
  await update('events', { id: eventId }, { details });
}

// Keuze van één deelnemer: eerst de kolom, anders de tijdelijke opslag
export function mealOf(p, rawEvent) {
  if (p.meal) return { meal: p.meal, note: p.meal_note || '' };
  const f = rawEvent?.details?.meal_choices?.[p.device_id];
  return f ? { meal: f.meal, note: f.note || '' } : null;
}
