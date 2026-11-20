-- 028: nieuwsbericht: Bioracer-clubshirts besteld (levering ~3e week januari), race singlets ~10 december, betalen via de app
-- Plak dit in Supabase → SQL Editor → New query → Run. Veilig om vaker te draaien.
insert into news (author, title, body, published_at, event_id, url, image)
select 'Aart van Steenbergen',
  'Clubshirts besteld, singlets bijna binnen 🧡',
  $txt$De nieuwe Bioracer-clubshirts zijn besteld! Ze worden rond de derde week van januari geleverd. Net op tijd om op 13 februari bij de Februariloop in onze eigen achtertuin te shinen. 😎

De luxe race singlets komen al rond 10 december binnen.

Heb je een shirt of singlet besteld? Betaal dan even hier in de app, met iDEAL in een paar tikken: bij Clubshirt of bij Race singlet (onder Meer). Zo ligt jouw exemplaar straks klaar. Dank je wel!$txt$,
  '2026-11-20',
  'race-2027-02-13-februariloop',
  '/shirt',
  '/club/singlet-bioracer.jpg'
where not exists (select 1 from news where title = 'Clubshirts besteld, singlets bijna binnen 🧡');
