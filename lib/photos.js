import { all, fileUrl } from './db';

// Alle foto's, nieuwste eerst, met aantal duimpjes en of dit apparaat er een gaf
export async function listPhotos(device, limit = 200) {
  let photos, likes;
  try {
    [photos, likes] = await Promise.all([all('photos'), all('photo_likes')]);
  } catch {
    return []; // tabel bestaat nog niet (002_fotowall.sql nog niet gedraaid)
  }
  return photos
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    .slice(0, limit)
    .map((p) => {
      const l = likes.filter((x) => x.photo_id === p.id);
      return {
        id: p.id,
        url: fileUrl(p.path),
        name: p.name,
        caption: p.caption,
        width: p.width,
        height: p.height,
        featured: !!p.featured,
        album: p.album || '',
        taken_on: p.taken_on || String(p.created_at || '').slice(0, 10),
        created_at: p.created_at,
        likes: l.length,
        liked: l.some((x) => x.device_id === device),
        mine: p.device_id === device,
      };
    });
}
