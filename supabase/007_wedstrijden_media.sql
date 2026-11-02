-- BenneKOM app — wedstrijden in de regio, link bij evenementen, en BenneKOM in de media
-- Plak dit in Supabase → SQL Editor → New query → Run. Veilig om vaker te draaien.

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
