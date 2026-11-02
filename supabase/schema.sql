-- BenneKOM app — database
-- Plak dit in Supabase → SQL Editor → New query → Run.
-- De app praat alleen via de server met de database (service role key),
-- dus Row Level Security staat aan zonder publieke policies.

create table if not exists events (
  id text primary key,
  type text not null check (type in ('training','special','wedstrijd','challenge')),
  title text not null,
  date date not null,
  time text default '',
  place text default '',
  description text default '',
  distances text default '',
  capacity int,
  registration boolean default false,
  carpool boolean default false,
  replaces_training boolean default false,
  created_at timestamptz default now()
);

-- "Ik ben erbij" én inschrijvingen: één lijst per event (ook voor gegenereerde dinsdagtrainingen)
create table if not exists participants (
  event_id text not null,
  device_id text not null,
  name text not null,
  created_at timestamptz default now(),
  primary key (event_id, device_id)
);

create table if not exists rides (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  device_id text not null,
  driver text not null,
  from_place text not null,
  depart_time text not null,
  seats int not null check (seats between 1 and 8),
  created_at timestamptz default now()
);

create table if not exists ride_passengers (
  ride_id uuid not null references rides(id) on delete cascade,
  device_id text not null,
  name text not null,
  created_at timestamptz default now(),
  primary key (ride_id, device_id)
);

create table if not exists challenge_results (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  name text not null,
  edition text not null,
  seconds int not null check (seconds between 600 and 3600),
  created_at timestamptz default now()
);

create table if not exists news (
  id uuid primary key default gen_random_uuid(),
  author text default 'Bestuur',
  title text not null,
  body text default '',
  event_id text,
  published_at date default current_date
);

create table if not exists suggestions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date date,
  place text default '',
  by_name text default '',
  created_at timestamptz default now()
);

create table if not exists push_subscriptions (
  endpoint text primary key,
  device_id text not null,
  subscription jsonb not null,
  prefs jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table events enable row level security;
alter table participants enable row level security;
alter table rides enable row level security;
alter table ride_passengers enable row level security;
alter table challenge_results enable row level security;
alter table news enable row level security;
alter table suggestions enable row level security;
alter table push_subscriptions enable row level security;

-- Startdata (overgenomen van hardloopclubbennekom.nl, november 2026)
insert into events (id,type,title,date,time,place,description,distances,capacity,registration,carpool,replaces_training) values
 ('dorpsrun-renswoude','wedstrijd','Dorpsrun Renswoude','2026-11-07','','Renswoude','Race in de regio. De club gaat samen; regel je rit via de carpool.','Kidsrun · 5 km · 10 km · 21,1 km',null,false,true,false),
 ('pasta-run','special','Run Pasta Run','2026-11-17','18:00','Dunantlaan 10–12, Bennekom','8 tot 10 km samen lopen en daarna samen eten. Vervangt deze dinsdag de gewone training.','',null,true,false,true),
 ('challenge-2026-11','challenge','BenneKOM 5km Challenge','2026-11-28','10:00','Langschoterweg 7, Bennekom','Test jezelf op 5 km, loop samen of haas een ander naar een mooie tijd. Elke laatste zaterdag van de maand.','5 km',null,true,false,false),
 ('run-dip-run','special','Run-Dip-Run met Sportrusten','2026-12-19','','De Dorpsherberg, Bennekom','Toelichting over koudetraining door Koen de Jong van Sportrusten, dan een duurloop naar de Rijn met een dip halverwege en terug naar Bennekom.','5–10 km',40,true,false,false),
 ('challenge-2026-12','challenge','BenneKOM 5km Challenge','2026-12-26','10:00','Langschoterweg 7, Bennekom','De laatste Challenge van het jaar.','5 km',null,true,false,false)
on conflict (id) do nothing;

insert into news (author,title,body,event_id,published_at) values
 ('Bestuur','Run-Dip-Run in Bennekom','Samen met Sportrusten: uitleg over koudetraining, een rustig rondje en een duik in de Rijn.','run-dip-run','2026-05-12'),
 ('Wilco','Nieuwe website','De club heeft een nieuwe site met kalender, calculator, voeding en meer.',null,'2026-04-22');
