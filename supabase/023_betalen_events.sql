-- 023: betalen voor een event via de app (bv. Pasta Run €17,50). Lid meldt 'ik heb betaald', Aart bevestigt in Beheer.
-- Plak dit in Supabase → SQL Editor → New query → Run. Veilig om vaker te draaien.
alter table participants add column if not exists paid_reported_at timestamptz;
alter table participants add column if not exists paid boolean not null default false;
