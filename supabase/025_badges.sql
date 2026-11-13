-- BenneKOM app — badges
-- Plak dit in Supabase → SQL Editor → New query → Run. Veilig om vaker te draaien.
-- Per lid: welke trainingen en events bevestigd zijn (via Strava of inchecken) en welke badges Beheer heeft toegekend.
-- Alleen zichtbaar voor het lid zelf; bij ontkoppelen van Strava verdwijnen de Strava-regels.

create table if not exists badge_log (
  device_id text not null,
  key text not null,                 -- 'training-2026-11-10', 'event:backyard-2026' of 'award:haas'
  date date not null,                -- datum van de training/het event (of van toekennen)
  source text not null,              -- 'strava', 'checkin' of 'beheer'
  activity_id bigint,                -- Strava-activiteit (alleen bij source = strava)
  created_at timestamptz default now(),
  primary key (device_id, key)
);
create index if not exists badge_log_device on badge_log (device_id);
alter table badge_log enable row level security;

-- tot waar de Strava-loopjes al doorzocht zijn voor de badges (unix-tijd)
alter table strava_links add column if not exists badges_until bigint;
