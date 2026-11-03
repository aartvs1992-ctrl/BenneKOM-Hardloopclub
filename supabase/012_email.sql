-- 012: e-mailadres bij het ledenprofiel (alleen zichtbaar voor de club, niet voor andere leden)
-- Plak dit in Supabase → SQL Editor → New query → Run. Veilig om vaker te draaien.
alter table profiles add column if not exists email text default '';
