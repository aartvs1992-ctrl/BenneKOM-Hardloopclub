-- 031: key sessions 1 en 2 iets langer (± 2u15 en 2u30): 5 min dribbel tussen de blokken en langer uitlopen.
-- Plak dit in Supabase → SQL Editor → New query → Run. Veilig om vaker te draaien.
update events set distances = '1u55–2u15 · ±16–35 km' where id = 'keysession-1';
update events set distances = '2u15–2u30 · ±19–39 km' where id = 'keysession-2';
