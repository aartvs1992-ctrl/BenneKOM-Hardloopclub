-- 033: CS-test (Critical Speed): 3 min all-out, 15–20 min pauze, 12 min all-out. Tab naast de coopertest.
-- Plak dit in Supabase → SQL Editor → New query → Run. Veilig om vaker te draaien.

create table if not exists cs_results (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  name text not null,
  test_date date not null,
  d3 int not null check (d3 between 400 and 1600),    -- meters in 3 minuten
  d12 int not null check (d12 between 1500 and 5500), -- meters in 12 minuten
  created_at timestamptz default now()
);
create index if not exists cs_results_device on cs_results (device_id);
alter table cs_results enable row level security;
