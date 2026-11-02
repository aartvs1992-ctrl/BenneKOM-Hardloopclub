-- BenneKOM app — persoonlijke Strava-segmenttijden
-- Plak dit in Supabase → SQL Editor → New query → Run (na de eerdere bestanden).
-- Strava-gegevens zijn alleen voor het lid zelf; de app toont ze nooit aan anderen.

create table if not exists strava_links (
  device_id text primary key,
  athlete_id bigint not null,
  firstname text default '',
  access_token text not null,
  refresh_token text not null,
  expires_at bigint not null,          -- unix-tijd
  synced_until bigint,                 -- tot welk moment activiteiten zijn doorzocht (unix-tijd)
  last_sync timestamptz,
  created_at timestamptz default now()
);

create table if not exists strava_efforts (
  id bigint primary key,               -- Strava segment-effort-id
  device_id text not null,
  athlete_id bigint not null,
  activity_id bigint not null,
  segment_id bigint not null,
  elapsed_time int not null,           -- seconden
  start_date timestamptz not null,
  created_at timestamptz default now()
);

create index if not exists strava_efforts_device on strava_efforts (device_id);

alter table strava_links enable row level security;
alter table strava_efforts enable row level security;
