-- BenneKOM app — alle aanvullingen na schema.sql in één keer (fotowall, Strava, profielen, profielvragen).
-- Veilig om vaker te draaien.

-- ===== 002_fotowall =====
-- BenneKOM app — fotowall

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  name text not null,
  caption text default '',
  path text not null,          -- bestandsnaam in de opslag-bucket 'photos'
  width int,
  height int,
  featured boolean default false, -- door beheer uitgelicht (komt groot op de homepagina)
  created_at timestamptz default now()
);

create table if not exists photo_likes (
  photo_id uuid not null references photos(id) on delete cascade,
  device_id text not null,
  created_at timestamptz default now(),
  primary key (photo_id, device_id)
);

alter table photos enable row level security;
alter table photo_likes enable row level security;

-- Openbare map voor de foto's (alleen lezen is openbaar; uploaden gaat via de app-server)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 5242880, array['image/jpeg','image/webp','image/png'])
on conflict (id) do nothing;

-- ===== 003_strava =====
-- BenneKOM app — persoonlijke Strava-segmenttijden
-- Strava-gegevens zijn alleen voor het lid zelf; de app toont ze nooit aan anderen.

create table if not exists strava_links (
  device_id text primary key,
  athlete_id bigint not null,
  firstname text default '',
  access_token text not null,
  refresh_token text not null,
  expires_at bigint not null,          -- unix-tijd
  synced_until bigint,                 -- tot welk moment activiteiten zijn doorzocht (unix-tijd)
  last_sync timestamptz,
  created_at timestamptz default now()
);

create table if not exists strava_efforts (
  id bigint primary key,               -- Strava segment-effort-id
  device_id text not null,
  athlete_id bigint not null,
  activity_id bigint not null,
  segment_id bigint not null,
  elapsed_time int not null,           -- seconden
  start_date timestamptz not null,
  created_at timestamptz default now()
);

create index if not exists strava_efforts_device on strava_efforts (device_id);

alter table strava_links enable row level security;
alter table strava_efforts enable row level security;

-- ===== 004_profielen =====
-- BenneKOM app — ledenprofielen met profielfoto

create table if not exists profiles (
  device_id text primary key,
  first_name text not null,
  last_name text default '',
  about text default '',
  photo_path text,                 -- bestand in de opslag-bucket 'photos' (map avatars/)
  restore_code text unique not null, -- code om je profiel op een ander toestel te openen
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

-- ===== 005_profielvragen =====
-- BenneKOM app — leuke vragen in het profiel

alter table profiles add column if not exists song text default '';        -- favoriete nummer tijdens het sporten
alter table profiles add column if not exists member_since text default ''; -- bijv. 2025-06
alter table profiles add column if not exists fun_fact text default '';     -- wat mensen niet over je weten
alter table profiles add column if not exists work text default '';         -- wat je doet voor werk

-- ===== 006_mooiste_ervaring =====
alter table profiles add column if not exists best_run text default '';

-- ===== 007_wedstrijden_media =====
-- BenneKOM app — wedstrijden in de regio, link bij evenementen, en BenneKOM in de media

alter table events add column if not exists url text default '';

create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  outlet text not null,          -- bijv. Ede Stad, De Gelderlander
  title text not null,
  published text default '',     -- bijv. 2025-11
  url text default '',
  summary text default '',
  created_at timestamptz default now()
);
alter table media enable row level security;

insert into media (outlet,title,published,summary)
select * from (values
 ('Ede Stad','De groei van BenneKOM','2025-11','Over hoe de loopclub in Bennekom in korte tijd groeide.'),
 ('De Gelderlander','Tweeling-ouders die samen op het podium staan','','Een ouderpaar van een tweeling dat maandelijks honderden kilometers loopt.')
) v(outlet,title,published,summary)
where not exists (select 1 from media);

insert into events (id,type,title,date,time,place,description,distances,capacity,registration,carpool,replaces_training,url) values
 ('race-2026-11-07-hydro-trailrun','wedstrijd','Hydro Trailrun','2026-11-07','','Harderwijk','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','12 · 22 · 30 · 43 km',null,false,true,false,''),
 ('race-2026-11-07-najaarsloop-cialfo','wedstrijd','Najaarsloop Cialfo','2026-11-07','','Epe','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','5 · 10 · 21,1 km',null,false,true,false,''),
 ('race-2026-11-14-zevenheuvelennacht','wedstrijd','Zevenheuvelennacht','2026-11-14','','Nijmegen','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','7 km',null,false,true,false,''),
 ('race-2026-11-14-vlinderloop','wedstrijd','Vlinderloop','2026-11-14','','Houten','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','4,4 · 10,7 · 14,8 · 21,1 km',null,false,true,false,''),
 ('race-2026-11-15-zevenheuvelenloop','wedstrijd','Zevenheuvelenloop','2026-11-15','','Nijmegen','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','15 km',null,false,true,false,'https://www.zevenheuvelenloop.nl'),
 ('race-2026-11-20-utrecht-science-park-night-run','wedstrijd','Utrecht Science Park Night Run','2026-11-20','','Utrecht','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','5 · 10 km',null,false,true,false,''),
 ('race-2026-11-20-night-trail-run','wedstrijd','Night Trail Run','2026-11-20','','Nieuwegein','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','5 · 7,5 · 15 km',null,false,true,false,''),
 ('race-2026-11-22-trailrun-maarten-maartens','wedstrijd','Trailrun Maarten Maartens','2026-11-22','','Doorn','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','6 · 10 · 20 km',null,false,true,false,''),
 ('race-2026-11-28-horaloop','wedstrijd','Horaloop','2026-11-28','','Ede','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','5 · 10 · 16 km',null,false,true,false,''),
 ('race-2026-11-28-walvoort-rondje-nederland-avondloop','wedstrijd','Walvoort Rondje Nederland Avondloop','2026-11-28','','Arnhem','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','5 km (+ jeugd)',null,false,true,false,''),
 ('race-2026-12-05-sint-nicolaasloop','wedstrijd','Sint-Nicolaasloop','2026-12-05','','Bunschoten-Spakenburg','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','3 · 5 · 10 · 15 km',null,false,true,false,''),
 ('race-2026-12-12-vlinderloop','wedstrijd','Vlinderloop','2026-12-12','','Houten','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','4,4 · 10,7 · 14,8 · 21,1 km',null,false,true,false,''),
 ('race-2026-12-18-kerstmannenloop','wedstrijd','Kerstmannenloop','2026-12-18','','Amersfoort','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','5 km',null,false,true,false,''),
 ('race-2026-12-19-natte-neuzen-kerst-trail','wedstrijd','Natte Neuzen Kerst Trail','2026-12-19','','Arnhem','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','7,5 · 10 km',null,false,true,false,''),
 ('race-2026-12-20-dijkencross','wedstrijd','Dijkencross','2026-12-20','','Pannerden','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','2,5 · 5 · 10 km',null,false,true,false,''),
 ('race-2026-12-27-physique-3de-kerstdagloop','wedstrijd','Physique 3de Kerstdagloop','2026-12-27','','Arnhem','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','7 · 14,3 · 21,1 km',null,false,true,false,''),
 ('race-2026-12-30-sylvestercross-by-night','wedstrijd','Sylvestercross by Night','2026-12-30','','Soest','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','3,9 km',null,false,true,false,''),
 ('race-2026-12-31-sylvestercross','wedstrijd','Sylvestercross','2026-12-31','','Soest','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','9,6 km',null,false,true,false,''),
 ('race-2027-01-02-florijnwinterloop','wedstrijd','Florijnwinterloop','2027-01-02','','Woudenberg','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','5 · 10 · 16,1 km',null,false,true,false,''),
 ('race-2027-01-09-vlinderloop','wedstrijd','Vlinderloop','2027-01-09','','Houten','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','4,4 · 10,7 · 14,8 · 21,1 km',null,false,true,false,''),
 ('race-2027-01-17-leemkuilcross','wedstrijd','Leemkuilcross','2027-01-17','','Berg en Dal','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','diverse afstanden',null,false,true,false,''),
 ('race-2027-01-24-safari-trail','wedstrijd','Safari Trail','2027-01-24','','Arnhem','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','5,1 · 12 · 24 km',null,false,true,false,''),
 ('race-2027-01-31-amersfoortse-bergcross','wedstrijd','Amersfoortse Bergcross','2027-01-31','','Amersfoort','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','2,5 · 5 · 7,5 · 10 km',null,false,true,false,''),
 ('race-2027-01-31-beekse-winterbosloop','wedstrijd','Beekse Winterbosloop','2027-01-31','','Beek (Montferland)','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','5 · 10 km',null,false,true,false,''),
 ('race-2027-02-05-midwintermarathon','wedstrijd','Midwintermarathon','2027-02-05','','Apeldoorn','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','8 · 16,1 · 25 km (5–7 feb)',null,false,true,false,'https://www.midwintermarathon.nl'),
 ('race-2027-02-13-februariloop','wedstrijd','Februariloop','2027-02-13','','Bennekom','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','2 · 5 · 10 · 21 km',null,false,true,false,''),
 ('race-2027-03-06-3bergenloop','wedstrijd','3bergenloop','2027-03-06','','Doorn','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','6 · 12 · 21 km',null,false,true,false,''),
 ('race-2027-03-13-vlinderloop','wedstrijd','Vlinderloop','2027-03-13','','Houten','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','4,4 · 10,7 · 14,8 · 21,1 km',null,false,true,false,''),
 ('race-2027-03-20-urban-trail-stevens-stadscross','wedstrijd','Urban Trail Stevens Stadscross','2027-03-20','','Nijmegen','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','7 km',null,false,true,false,''),
 ('race-2027-03-21-stevensloop','wedstrijd','Stevensloop','2027-03-21','','Nijmegen','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','5 · 10 · 21,1 km',null,false,true,false,''),
 ('race-2027-04-17-amerongse-koploop-trailrun','wedstrijd','Amerongse Koploop Trailrun','2027-04-17','','Amerongen','Wedstrijd in de regio. Controleer tijden en inschrijven op de site van de organisatie. Rij je mee? Regel het via de carpool.','6 · 10 · 16 · 25 km',null,false,true,false,'')
on conflict (id) do nothing;

-- ===== 008_partners =====
-- BenneKOM app — partners met ledenkorting
create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  about text default '',         -- korte uitleg over de partner
  benefit text default '',       -- wat leden krijgen, bijv. 10% korting op schoenen en kleding
  code text default '',          -- kortingscode (leeg = geen code nodig)
  how text default '',           -- hoe je de korting krijgt
  url text default '',
  sort int default 0,
  created_at timestamptz default now()
);
alter table partners enable row level security;

insert into partners (name, about, benefit, code, how, url, sort)
select * from (values
 ('Runners World Ede', 'Hardloopspeciaalzaak in Ede voor schoenen, kleding en advies. Partner van BenneKOM en bekend van de finishboog bij de Backyard Run.', '10% korting op hardloopschoenen en kleding', '', 'Laat bij de kassa weten dat je lid bent van BenneKOM.', '', 1),
 ('Fitsynergy', 'Webshop voor sportvoeding, magnesium, vitamines en supplementen, met merken als Maurten en Humantra.', 'Korting op je bestelling', 'BenneKOM10', 'Vul de code in bij het afrekenen in de webshop.', 'https://www.fitsynergy.nl/', 2)
) v(name, about, benefit, code, how, url, sort)
where not exists (select 1 from partners);

update partners set name='Fitsynergy', about='Webshop voor sportvoeding, magnesium, vitamines en supplementen, met merken als Maurten en Humantra.', benefit='Korting op je bestelling', how='Vul de code in bij het afrekenen in de webshop.', url='https://www.fitsynergy.nl/' where name='FitsforEnergy';

-- 009: meer informatie bij specials (foto, verhaal, programma, gastspreker)
alter table events add column if not exists details jsonb;
-- eerste concepttekst van de app weghalen (de app vult zelf de nieuwste standaardtekst aan)
update events set details = null
where id in ('pasta-run','run-dip-run')
  and (details->>'story' like 'Samen een rondje van 8 tot 10 km door Bennekom en de bossen, in groepjes op je eigen tempo. Daarna schuiven we aan voor een grote pan pasta.%'
    or details->>'story' like 'Koen de Jong van Sportrusten vertelt eerst%');

-- 010: interesse voor clubshirts (verzamelen tot er genoeg zijn voor een bestelling)
create table if not exists shirt_interest (
  device_id text not null,
  item text not null,            -- 'kort' of 'lang'
  size text not null,
  qty int default 1,
  name text default '',
  updated_at timestamptz default now(),
  primary key (device_id, item)
);
alter table shirt_interest enable row level security;

-- 011: nieuws met link naar de Strava-post en een foto; oude voorbeeldberichten weg
alter table news add column if not exists url text default '';
alter table news add column if not exists image text default '';
delete from news where (author = 'Wilco' and title = 'Nieuwe website') or (author = 'Bestuur' and title = 'Run-Dip-Run in Bennekom' and published_at = '2026-05-12');

-- ===== 012_email =====
-- 012: e-mailadres bij het ledenprofiel (alleen zichtbaar voor de club, niet voor andere leden)
-- Plak dit in Supabase → SQL Editor → New query → Run. Veilig om vaker te draaien.
alter table profiles add column if not exists email text default '';

-- ===== 013_nieuws_backyard =====
-- 013: nieuwsbericht over de Backyard Run (jubileum, 31 oktober 2026) bij Nieuws en media
-- Plak dit in Supabase → SQL Editor → New query → Run. Veilig om vaker te draaien.
insert into news (author, title, body, published_at, url, image)
select 'Aart van Steenbergen',
  'Backyard BenneKOM hardloopclub – 1 jaar! 🎉',
  $txt$Zaterdag was het dan eindelijk zover: het eerste jubileum van de BenneKOM hardloopclub. Dat vierden we met een Backyard van maximaal 10 rondes voor het goede doel Spieren voor Spieren. Het werd een dag die bij iedereen als een mooie herinnering aan de club zal blijven hangen, en ook qua professionaliteit weer een stap omhoog. Mooi om te zien waar we in ruim een jaar tijd zijn gekomen.

Om 09:00 ging de eerste ronde van start. Gedurende de dag kon iedereen aansluiten, en om 18:00 begonnen nog zo'n 10 lopers aan hun reeks van 10 rondes. Daarvoor waren er al veel mooie momenten en persoonlijke successen, zoals meerdere afstandsrecords. Iedereen had namelijk zijn eigen doel voor die dag. Het enthousiasme en het oprecht meeleven met en blij zijn voor elkaar maakten het echt een geweldige dag samen.

Uiteindelijk liepen we natuurlijk voor Spieren voor Spieren, en we hebben een prachtig bedrag opgehaald van €3.995! Dank aan iedereen die hieraan heeft bijgedragen. 💪

Ook veel dank aan onze sponsors voor hun steun bij dit evenement: Runnersworld, Ales Metaaltechniek (voor de medailles) en Kwalitaria. Want na de 10 rondes werd er onder het genot van een patatje nog even nagepraat, een mooie afsluiter van de dag. 🍟

Tot slot grote dank aan Daniel Nijland voor het prachtig vastleggen van deze dag. Benieuwd naar meer foto's? Check dan onze Instagrampagina: BenneKOM hardloopclub 📸$txt$,
  '2026-11-04',
  'https://www.strava.com/clubs/1629265/posts/50381871',
  '/club/samen-lachen.jpg'
where not exists (select 1 from news where url = 'https://www.strava.com/clubs/1629265/posts/50381871');

-- ===== 014_samen_lopen =====
-- 014: Samen lopen: loopjes die leden zelf plannen buiten de dinsdag
-- Plak dit in Supabase → SQL Editor → New query → Run. Veilig om vaker te draaien.
alter table events drop constraint if exists events_type_check;
alter table events add constraint events_type_check check (type in ('training','special','wedstrijd','challenge','samenloop'));
alter table events add column if not exists details jsonb;

-- ===== 018_strava_historie =====
-- Plak dit in Supabase → SQL Editor → New query → Run. Veilig om vaker te draaien.
alter table strava_links add column if not exists history_before bigint; -- tot hoe ver terug al gezocht is (unix-tijd); 1 = klaar

-- ===== 019_singlets =====
-- Plak dit in Supabase → SQL Editor → New query → Run. Veilig om vaker te draaien.
create table if not exists singlet_claims (
  id uuid primary key default gen_random_uuid(),
  batch text not null,            -- bestelronde, bijv. 'singlet-2026-1'
  device_id text not null,
  name text not null,
  size text not null,
  status text not null default 'geclaimd' check (status in ('geclaimd','betaald','opgehaald')),
  created_at timestamptz default now(),
  unique (batch, device_id)       -- één singlet per lid per bestelronde
);
alter table singlet_claims enable row level security;

-- Claimen in één stap, zodat er nooit meer geclaimd wordt dan er op voorraad is
create or replace function claim_singlet(p_batch text, p_device text, p_name text, p_size text, p_stock int)
returns text language plpgsql as $$
declare n int;
begin
  perform pg_advisory_xact_lock(hashtext('singlet:' || p_batch));
  if exists (select 1 from singlet_claims where batch = p_batch and device_id = p_device) then return 'al'; end if;
  select count(*) into n from singlet_claims where batch = p_batch and size = p_size;
  if n >= p_stock then return 'op'; end if;
  insert into singlet_claims (batch, device_id, name, size) values (p_batch, p_device, p_name, p_size);
  return 'ok';
end $$;
revoke execute on function claim_singlet(text, text, text, text, int) from public, anon, authenticated;

-- ===== 020_berichten =====
create table if not exists dm_settings (
  device_id text primary key,
  open boolean not null default true,
  updated_at timestamptz default now()
);
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  from_device text not null,
  to_device text not null,
  body text not null,
  created_at timestamptz default now(),
  read_at timestamptz
);
create index if not exists messages_to_idx on messages (to_device, created_at);
create index if not exists messages_from_idx on messages (from_device, created_at);
alter table dm_settings enable row level security;
alter table messages enable row level security;

-- ===== 021_betalen =====
alter table singlet_claims add column if not exists paid_reported_at timestamptz;
alter table shirt_interest add column if not exists paid_reported_at timestamptz;
alter table shirt_interest add column if not exists paid boolean not null default false;

-- ===== 022_maaltijdkeuze =====
alter table participants add column if not exists meal text;
alter table participants add column if not exists meal_note text;

-- ===== 023_betalen_events =====
alter table participants add column if not exists paid_reported_at timestamptz;
alter table participants add column if not exists paid boolean not null default false;

-- ===== 024_thrive =====
insert into partners (name, about, benefit, code, how, url, sort)
select 'Thrive', 'Belgisch alcoholvrij sportbier met 10 gram proteïne per blikje, ontwikkeld met de KU Leuven. Ideaal na de training of wedstrijd. Ook hun nieuwe electrolyte soda’s met 0 gram suiker.', '10% korting in de webshop', 'BenneKOM10', 'Vul de code in bij het afrekenen op thrivebeer.com.', 'https://www.thrivebeer.com/', 3
where not exists (select 1 from partners where lower(name) = 'thrive');
