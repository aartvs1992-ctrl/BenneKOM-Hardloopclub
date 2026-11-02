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
