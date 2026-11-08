-- BenneKOM app — 5km Challenge: ook oudere loopjes (ouder dan een jaar) doorzoeken.
-- Plak dit in Supabase → SQL Editor → New query → Run. Veilig om vaker te draaien.
alter table strava_links add column if not exists history_before bigint; -- tot hoe ver terug al gezocht is (unix-tijd); 1 = klaar
