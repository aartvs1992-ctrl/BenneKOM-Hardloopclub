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
