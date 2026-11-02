-- BenneKOM app — ledenprofielen met profielfoto
-- Plak dit in Supabase → SQL Editor → New query → Run (na de eerdere bestanden).

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
