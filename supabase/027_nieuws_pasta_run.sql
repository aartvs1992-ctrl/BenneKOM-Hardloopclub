-- 027: nieuwsbericht over de eerste Pasta Run bij Restaurant Zicht (17 november 2026)
-- Plak dit in Supabase → SQL Editor → New query → Run. Veilig om vaker te draaien.
insert into news (author, title, body, published_at, event_id, url, image)
select 'Aart van Steenbergen',
  'Eerste BenneKOM Pasta Run bij Zicht 🍝',
  $txt$Afgelopen dinsdag hielden we onze allereerste Pasta Run, samen met Restaurant Zicht. Zicht zit al zo'n vijf jaar in het centrum van Bennekom en het is een prachtige plek. Wat leuk dat we deze samenwerking zijn aangegaan!

Op zondag stonden bijna 30 BenneKOM'ers aan de start van de Zevenheuvelenloop, met mooie prestaties van iedereen. Bij sommigen zat de spierpijn dus nog in de benen, en zij maakten een wandeling door Bennekom. De rest verzamelde op de vertrouwde plek aan de Dunantlaan voor een loopje van een kleine 8 kilometer.

Rond kwart voor zeven schoven we met bijna 20 man aan bij Zicht. Er was keuze uit pasta met vlees, vis of vega, dus voor ieder wat wils.

Het was super gezellig. Je sprak eens andere mensen dan op de dinsdag of tijdens de intervallen, en het ging ook eens níét over hardlopen. 😉

Dit was zeker niet de laatste keer. Dank je wel, Zicht, tot de volgende! 🧡$txt$,
  '2026-11-19',
  'pasta-run',
  '',
  '/club/pasta-run-zicht.jpg'
where not exists (select 1 from news where title = 'Eerste BenneKOM Pasta Run bij Zicht 🍝');
