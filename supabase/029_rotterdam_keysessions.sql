-- 029: NN Marathon Rotterdam (zo 11 april 2027) en de drie key sessions in de aanloop.
-- Plak dit in Supabase → SQL Editor → New query → Run. Veilig om vaker te draaien.
-- Tekst, programma en foto van de key sessions komen uit de app (lib/seed.js); aanvullen of overschrijven kan via Beheer.
-- Starttijd en plek van de key sessions staan nog leeg: vul ze in via Beheer zodra de ronde bekend is.
insert into events (id, type, title, date, time, place, description, distances, capacity, registration, carpool, replaces_training) values
  ('race-2027-04-11-nn-marathon-rotterdam', 'wedstrijd', 'NN Marathon Rotterdam', '2027-04-11', '10:00', 'Rotterdam',
   'Een flinke BenneKOM-ploeg loopt mee. Meld je aan, regel je rit via de carpool en kijk in de Agenda onder Op weg naar Rotterdam voor de key sessions.',
   '42,195 km (+ 10 km en City Run op za 10 apr)', null, false, true, false),
  ('keysession-1', 'special', 'Key session 1 · Op weg naar Rotterdam', '2027-01-24', '', 'Bennekom',
   'Lange zondagsessie met 4 × 15 min op marathontempo. Alle niveaus, iedereen op zijn eigen tempo.', '1u55–2u15 · ±16–35 km', null, true, false, false),
  ('keysession-2', 'special', 'Key session 2 · Op weg naar Rotterdam', '2027-02-21', '', 'Bennekom',
   'Lange zondagsessie met 3 × 25 min op marathontempo. Alle niveaus, iedereen op zijn eigen tempo.', '2u15–2u30 · ±19–39 km', null, true, false, false),
  ('keysession-3', 'special', 'Key session 3 · Op weg naar Rotterdam', '2027-03-21', '', 'Bennekom',
   'De generale repetitie: 3 × 35 min op marathontempo (kort: 3 × 30) of 85 min aan één stuk.', '2u25–2u40 · ±21–43 km', null, true, false, false)
on conflict (id) do nothing;
