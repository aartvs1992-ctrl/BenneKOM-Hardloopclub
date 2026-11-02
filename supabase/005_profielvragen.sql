-- BenneKOM app — leuke vragen in het profiel
-- Plak dit in Supabase → SQL Editor → New query → Run (na 004_profielen.sql).

alter table profiles add column if not exists song text default '';        -- favoriete nummer tijdens het sporten
alter table profiles add column if not exists member_since text default ''; -- bijv. 2025-06
alter table profiles add column if not exists fun_fact text default '';     -- wat mensen niet over je weten
alter table profiles add column if not exists work text default '';         -- wat je doet voor werk
