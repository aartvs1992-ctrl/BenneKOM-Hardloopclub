-- 009: meer informatie bij specials (foto, verhaal, programma, gastspreker)
alter table events add column if not exists details jsonb;

update events set details = '{"image":"/club/nazitten.jpg","story":"Samen een rondje van 8 tot 10 km door Bennekom en de bossen, in groepjes op je eigen tempo. Daarna schuiven we aan voor een grote pan pasta. Een mooie avond om nieuwe clubgenoten te leren kennen.","program":"18:00 Verzamelen\n18:15 Start van de loop, 8–10 km in groepjes\n19:15 Douchen en omkleden\n19:30 Samen pasta eten","bring":"Hardloopkleding en een lampje\nDroge kleren voor bij het eten","cost":"","host":null}'::jsonb
where id = 'pasta-run' and details is null;

update events set details = '{"image":"/club/groep-in-de-mist.jpg","story":"Koen de Jong van Sportrusten vertelt eerst wat koudetraining met je lichaam doet en hoe je het veilig aanpakt. Daarna lopen we samen een duurloop naar de Rijn. Halverwege gaan we het water in, voor wie durft, en daarna lopen we warm terug naar Bennekom.","program":"Verzamelen bij De Dorpsherberg\nToelichting over koudetraining door Koen de Jong\nDuurloop naar de Rijn\nDip in de Rijn\nTerug naar Bennekom","bring":"Zwemkleding onder je loopkleding\nHanddoek en droge, warme kleren\nSlippers of waterschoenen","cost":"","host":{"name":"Koen de Jong","role":"Sportrusten","bio":"Koen vertelt over koudetraining: wat het met je lichaam doet en hoe je het veilig opbouwt.","photo":""}}'::jsonb
where id = 'run-dip-run' and details is null;
