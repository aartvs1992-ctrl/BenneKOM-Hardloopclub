-- BenneKOM app — ledenbeheer: bijhouden wanneer een lid voor het laatst in de app was.
-- Plak dit in Supabase → SQL Editor → New query → Run.
alter table profiles add column if not exists last_seen timestamptz;
