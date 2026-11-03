-- 011: nieuws met link naar de Strava-post en een foto; oude voorbeeldberichten weg
alter table news add column if not exists url text default '';
alter table news add column if not exists image text default '';
delete from news where (author = 'Wilco' and title = 'Nieuwe website') or (author = 'Bestuur' and title = 'Run-Dip-Run in Bennekom' and published_at = '2026-05-12');
