-- 020: berichten tussen leden (alleen tussen leden die dit zelf hebben aangezet)
-- Plak dit in Supabase → SQL Editor → New query → Run. Veilig om vaker te draaien.
create table if not exists dm_settings (
  device_id text primary key,
  open boolean not null default true,    -- staat standaard aan; open = false betekent: lid heeft het zelf uitgezet
  updated_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  from_device text not null,
  to_device text not null,
  body text not null,
  created_at timestamptz default now(),
  read_at timestamptz
);
create index if not exists messages_to_idx on messages (to_device, created_at);
create index if not exists messages_from_idx on messages (from_device, created_at);

alter table dm_settings enable row level security;
alter table messages enable row level security;
