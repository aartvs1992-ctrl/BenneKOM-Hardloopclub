-- BenneKOM app — badges: afstand per clubtraining, voor de Clubkilometers-badges.
-- Plak dit in Supabase → SQL Editor → New query → Run. Veilig om vaker te draaien.
alter table badge_log add column if not exists distance integer; -- meters, uit Strava
