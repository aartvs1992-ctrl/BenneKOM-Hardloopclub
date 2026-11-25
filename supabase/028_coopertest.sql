-- 028: Coopertest (12 minuten zo ver mogelijk) als aparte Challenge, met tempo's volgens Bakken
-- Plak dit in Supabase → SQL Editor → New query → Run. Veilig om vaker te draaien.

create table if not exists cooper_results (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  name text not null,
  test_date date not null,
  meters int not null check (meters between 1000 and 5500),
  created_at timestamptz default now()
);
create index if not exists cooper_results_device on cooper_results (device_id);
alter table cooper_results enable row level security;

-- Voorbeeld: Aarts eigen coopertest met BenneKOM (3890 m op dinsdag 24 november 2026)
insert into cooper_results (device_id, name, test_date, meters)
select p.device_id, trim(p.first_name || ' ' || coalesce(p.last_name, '')), '2026-11-24', 3890
from profiles p
where p.first_name ilike 'Aart' and p.last_name ilike '%Steenbergen%'
  and not exists (select 1 from cooper_results c where c.device_id = p.device_id and c.test_date = '2026-11-24');
