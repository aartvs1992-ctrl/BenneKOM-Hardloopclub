-- BenneKOM app — foto's koppelen aan een moment (training, wedstrijd, special) en een datum.
-- Plak dit in Supabase → SQL Editor → New query → Run.
-- Zonder deze kolommen werkt de fotopagina gewoon; alleen het kiezen van een moment wordt dan niet opgeslagen.

alter table photos add column if not exists album text default '';
alter table photos add column if not exists taken_on date;
