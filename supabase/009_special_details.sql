-- 009: meer informatie bij specials (foto, verhaal, programma, gastspreker)
alter table events add column if not exists details jsonb;
-- eerste concepttekst van de app weghalen (de app vult zelf de nieuwste standaardtekst aan)
update events set details = null
where id in ('pasta-run','run-dip-run')
  and (details->>'story' like 'Samen een rondje van 8 tot 10 km door Bennekom en de bossen, in groepjes op je eigen tempo. Daarna schuiven we aan voor een grote pan pasta.%'
    or details->>'story' like 'Koen de Jong van Sportrusten vertelt eerst%');
