-- 019: race singlet claimen (beperkte voorraad per maat, wie het eerst claimt)
-- Plak dit in Supabase → SQL Editor → New query → Run. Veilig om vaker te draaien.
create table if not exists singlet_claims (
  id uuid primary key default gen_random_uuid(),
  batch text not null,            -- bestelronde, bijv. 'singlet-2026-1'
  device_id text not null,
  name text not null,
  size text not null,
  status text not null default 'geclaimd' check (status in ('geclaimd','betaald','opgehaald')),
  created_at timestamptz default now(),
  unique (batch, device_id)       -- één singlet per lid per bestelronde
);
alter table singlet_claims enable row level security;

-- Claimen in één stap, zodat er nooit meer geclaimd wordt dan er op voorraad is
create or replace function claim_singlet(p_batch text, p_device text, p_name text, p_size text, p_stock int)
returns text language plpgsql as $$
declare n int;
begin
  perform pg_advisory_xact_lock(hashtext('singlet:' || p_batch));
  if exists (select 1 from singlet_claims where batch = p_batch and device_id = p_device) then return 'al'; end if;
  select count(*) into n from singlet_claims where batch = p_batch and size = p_size;
  if n >= p_stock then return 'op'; end if;
  insert into singlet_claims (batch, device_id, name, size) values (p_batch, p_device, p_name, p_size);
  return 'ok';
end $$;
revoke execute on function claim_singlet(text, text, text, text, int) from public, anon, authenticated;
