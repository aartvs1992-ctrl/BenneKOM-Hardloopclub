-- 032: kortere titels voor de key sessions, zodat ze op één regel passen.
-- Plak dit in Supabase → SQL Editor → New query → Run. Veilig om vaker te draaien.
update events set title = 'Key session 1' where id = 'keysession-1';
update events set title = 'Key session 2' where id = 'keysession-2';
update events set title = 'Key session 3' where id = 'keysession-3';
