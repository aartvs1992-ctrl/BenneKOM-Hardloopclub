// Fotowall: lijst ophalen (GET) en foto plaatsen / duimpje / verwijderen (POST)
import { all, insert, upsert, remove, putFile, deleteFile } from '@/lib/db';
import { listPhotos } from '@/lib/photos';

export const dynamic = 'force-dynamic';

const clean = (s, max = 80) => String(s ?? '').trim().slice(0, max);
const bad = (msg, status = 400) => Response.json({ error: msg }, { status });
const MAX_BYTES = 3 * 1024 * 1024; // de app verkleint foto's vooraf tot ruim onder deze grens

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
