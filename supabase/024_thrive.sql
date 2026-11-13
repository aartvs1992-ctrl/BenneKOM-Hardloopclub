-- 024: Thrive als partner (alcoholvrij sportbier). Code BenneKOM10 = 10% korting in de webshop.
-- Plak dit in Supabase → SQL Editor → New query → Run. Veilig om vaker te draaien.
insert into partners (name, about, benefit, code, how, url, sort)
select 'Thrive', 'Belgisch alcoholvrij sportbier met 10 gram proteïne per blikje, ontwikkeld met de KU Leuven. Ideaal na de training of wedstrijd. Ook hun nieuwe electrolyte soda’s met 0 gram suiker.', '10% korting in de webshop', 'BenneKOM10', 'Vul de code in bij het afrekenen op thrivebeer.com.', 'https://www.thrivebeer.com/', 3
where not exists (select 1 from partners where lower(name) = 'thrive');
