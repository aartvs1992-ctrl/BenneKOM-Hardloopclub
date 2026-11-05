-- BenneKOM app — video's op de fotopagina.
-- Plak dit in Supabase → SQL Editor → New query → Run.

-- Bij een video staat in 'path' het stilstaande voorbeeldplaatje en in 'video_path' het filmpje zelf.
alter table photos add column if not exists video_path text;
alter table photos add column if not exists duration real;

-- De map 'photos' mag nu ook video's bevatten, tot 50 MB per bestand (de grens van het gratis abonnement).
update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array['image/jpeg','image/webp','image/png','video/mp4','video/quicktime','video/webm']
where id = 'photos';
