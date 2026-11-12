-- 022: maaltijdkeuze bij inschrijven (bv. Pasta Run: vlees, vis of vega + eigen opmerking).
-- Plak dit in Supabase → SQL Editor → New query → Run. Veilig om vaker te draaien.
alter table participants add column if not exists meal text;
alter table participants add column if not exists meal_note text;
