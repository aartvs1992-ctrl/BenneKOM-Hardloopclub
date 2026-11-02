-- BenneKOM app — fotowall
-- Plak dit in Supabase → SQL Editor → New query → Run (na schema.sql).

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
