-- 014: Samen lopen: loopjes die leden zelf plannen buiten de dinsdag
-- Plak dit in Supabase → SQL Editor → New query → Run. Veilig om vaker te draaien.
alter table events drop constraint if exists events_type_check;
alter table events add constraint events_type_check check (type in ('training','special','wedstrijd','challenge','samenloop'));
alter table events add column if not exists details jsonb;
