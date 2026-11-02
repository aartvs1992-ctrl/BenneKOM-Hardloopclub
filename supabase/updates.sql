-- BenneKOM app — alle aanvullingen na schema.sql in één keer (fotowall, Strava, profielen, profielvragen).
-- Veilig om vaker te draaien.

-- ===== 002_fotowall =====
-- BenneKOM app — fotowall

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  name text not null,
  caption text default '',
  path text not null,          -- bestandsnaam in de opslag-bucket 'photos'
  width int,
  height int,
  featured boolean default false, -- door beheer uitgelicht (komt groot op de homepagina)
  created_at timestamptz default now()
);

create table if not exists photo_likes (
  photo_id uuid not null references photos(id) on delete cascade,
  device_id text not null,
  created_at timestamptz default now(),
  primary key (photo_id, device_id)
);

alter table photos enable row level security;
alter table photo_likes enable row level security;

-- Openbare map voor de foto's (alleen lezen is openbaar; uploaden gaat via de app-server)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 5242880, array['image/jpeg','image/webp','image/png'])
on conflict (id) do nothing;

-- ===== 003_strava =====
-- BenneKOM app — persoonlijke Strava-segmenttijden
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

-- ===== 004_profielen =====
-- BenneKOM app — ledenprofielen met profielfoto

create table if not exists profiles (
  device_id text primary key,
  first_name text not null,
  last_name text default '',
  about text default '',
  photo_path text,                 -- bestand in de opslag-bucket 'photos' (map avatars/)
  restore_code text unique not null, -- code om je profiel op een ander toestel te openen
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

-- ===== 005_profielvragen =====
-- BenneKOM app — leuke vragen in het profiel

alter table profiles add column if not exists song text default '';        -- favoriete nummer tijdens het sporten
alter table profiles add column if not exists member_since text default ''; -- bijv. 2025-06
alter table profiles add column if not exists fun_fact text default '';     -- wat mensen niet over je weten
alter table profiles add column if not exists work text default '';         -- wat je doet voor werk
