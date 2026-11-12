-- 022: bij inschrijven voor een etentje (bv. de Pasta Run) een gerecht kiezen, allergieën doorgeven en betalen via de bunq.me-link.
-- Plak dit in Supabase → SQL Editor → New query → Run. Veilig om vaker te draaien.
alter table participants add column if not exists meal text;
alter table participants add column if not exists diet text;
alter table participants add column if not exists paid boolean not null default false;
alter table participants add column if not exists paid_reported_at timestamptz;
