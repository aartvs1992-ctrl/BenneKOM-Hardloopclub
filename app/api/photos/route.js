// Fotowall: lijst ophalen (GET) en foto plaatsen / duimpje / verwijderen (POST)
import { all, insert, upsert, remove, putFile, deleteFile, signedUpload } from '@/lib/db';
import { listPhotos } from '@/lib/photos';

export const dynamic = 'force-dynamic';

const clean = (s, max = 80) => String(s ?? '').trim().slice(0, max);
const bad = (msg, status = 400) => Response.json({ error: msg }, { status });
const MAX_BYTES = 3 * 1024 * 1024; // de app verkleint foto's vooraf tot ruim onder deze grens
const MAX_VIDEO = 50 * 1024 * 1024; // grens per bestand in het gratis Supabase-abonnement
const VIDEO_TYPES = { 'video/mp4': 'mp4', 'video/quicktime': 'mov', 'video/webm': 'webm' };
const VIDEO_PATH = /^videos\/\d{4}-\d{2}-\d{2}\/[0-9a-f-]{36}\.(mp4|mov|webm)$/;
const VIDEOS_PER_DAY = 3;

export async function GET(req) {
  const device = new URL(req.url).searchParams.get('device') || '';
  try {
    return Response.json({ photos: await listPhotos(device) });
  } catch {
    return bad('De foto\'s konden niet worden geladen.', 500);
  }
}

export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { return bad('Ongeldig verzoek. Is de foto te groot?'); }
  const device = clean(b.device, 64);
  if (!device) return bad('Apparaat onbekend. Herlaad de app.');

  try {
    switch (b.action) {
      // Stap 1 voor een video: een eenmalige upload-link; de browser stuurt het filmpje rechtstreeks naar de opslag
      case 'videoSlot': {
        if (!clean(b.name)) return bad('Vul eerst je naam in bij Meer.');
        const ext = VIDEO_TYPES[b.type];
        if (!ext) return bad('Dit soort video wordt niet ondersteund. Gebruik een gewone video van je telefoon.');
        if (!(b.size > 0) || b.size > MAX_VIDEO) return bad('Deze video is te groot (max. 50 MB). Kies een kortere video.');
        const today = new Date().toISOString().slice(0, 10);
        const n = (await all('photos')).filter((p) => p.device_id === device && p.video_path && String(p.created_at).startsWith(today)).length;
        if (n >= VIDEOS_PER_DAY) return bad(`Je hebt vandaag al ${VIDEOS_PER_DAY} video's geplaatst. Morgen weer!`);
        const path = `videos/${today}/${crypto.randomUUID()}.${ext}`;
        const url = await signedUpload(path);
        if (!url) return bad("Video's plaatsen werkt alleen in de online app.");
        return Response.json({ path, url });
      }
      case 'upload': {
        const name = clean(b.name);
        if (!name) return bad('Vul eerst je naam in bij Meer.');
        const m = /^data:(image\/(jpeg|webp|png));base64,(.+)$/.exec(b.image || '');
        if (!m) return bad('Dit bestand is geen foto.');
        const buf = Buffer.from(m[3], 'base64');
        if (buf.length > MAX_BYTES) return bad('Deze foto is te groot.');
        // max. 20 foto's per apparaat per dag, tegen per ongeluk dubbel uploaden
        const today = new Date().toISOString().slice(0, 10);
        const n = (await all('photos')).filter((p) => p.device_id === device && String(p.created_at).startsWith(today)).length;
        if (n >= 20) return bad('Je hebt vandaag al 20 foto\'s geplaatst. Morgen weer!');
        const ext = m[2] === 'jpeg' ? 'jpg' : m[2];
        const path = `${today}/${crypto.randomUUID()}.${ext}`;
        await putFile(path, buf, m[1]);
        const row = {
          device_id: device, name, caption: clean(b.caption, 140), path,
          width: parseInt(b.width, 10) || null, height: parseInt(b.height, 10) || null,
        };
        const album = clean(b.album, 60);
        const videoPath = typeof b.video_path === 'string' && VIDEO_PATH.test(b.video_path) ? b.video_path : null;
        if (b.video_path && !videoPath) return bad('Deze video is niet goed geüpload. Probeer het opnieuw.');
        if (videoPath) {
          try {
            await insert('photos', { ...row, album, taken_on: takenOn, video_path: videoPath, duration: Math.round(Number(b.duration) * 10) / 10 || null });
          } catch (e) {
            await deleteFile(path).catch(() => {});
            await deleteFile(videoPath).catch(() => {});
            if (/video_path|duration|album|taken_on|column/i.test(String(e.message))) return bad("Video's staan nog niet aan in de database. Vraag Aart om 016_videos.sql te draaien.");
            throw e;
          }
          break;
        }
        const takenOn = /^\d{4}-\d{2}-\d{2}$/.test(b.taken_on || '') && b.taken_on <= today ? b.taken_on : null;
        try {
          await insert('photos', { ...row, album, taken_on: takenOn });
        } catch (e) {
          // kolommen album/taken_on bestaan nog niet (015_foto_albums.sql nog niet gedraaid)
          if (!/album|taken_on|column/i.test(String(e.message))) throw e;
          await insert('photos', row);
        }
        break;
      }
      case 'like': {
        if (b.on) await upsert('photo_likes', { photo_id: b.id, device_id: device }, ['photo_id', 'device_id']);
        else await remove('photo_likes', { photo_id: b.id, device_id: device });
        break;
      }
      case 'delete': {
        const p = (await all('photos')).find((x) => x.id === b.id);
        if (!p || p.device_id !== device) return bad('Deze foto is niet van jou.');
        await remove('photo_likes', { photo_id: p.id });
        await remove('photos', { id: p.id });
        await deleteFile(p.path);
        if (p.video_path) await deleteFile(p.video_path).catch(() => {});
        break;
      }
      default:
        return bad('Onbekende actie.');
    }
    return Response.json({ photos: await listPhotos(device) });
  } catch (e) {
    return bad('Opslaan lukte niet. Probeer het nog eens.', 500);
  }
}
