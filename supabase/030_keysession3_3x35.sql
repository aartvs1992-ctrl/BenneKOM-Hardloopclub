-- 030: key session 3 wordt 3 × 35 min op marathontempo (kort: 3 × 30), binnen 2u40.
-- Plak dit in Supabase → SQL Editor → New query → Run. Veilig om vaker te draaien.
update events
set description = 'De generale repetitie: 3 × 35 min op marathontempo (kort: 3 × 30) of 85 min aan één stuk.',
    distances = '2u25–2u40 · ±21–43 km'
where id = 'keysession-3';
