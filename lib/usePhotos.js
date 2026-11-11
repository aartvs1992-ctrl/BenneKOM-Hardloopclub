'use client';
import { useCallback, useEffect, useState } from 'react';
import { useApp } from '@/components/AppProvider';

// Foto's ophalen en bewerken vanuit de browser
// Laatst geladen foto's bewaren, zodat een pagina ze meteen toont en op de achtergrond ververst
let cache = null;
const keep = (p) => { cache = p; return p; };

export function usePhotos() {
  const { local, toast } = useApp();
  const [photos, setPhotosRaw] = useState(cache);
  const setPhotos = useCallback((v) => setPhotosRaw((prev) => keep(typeof v === 'function' ? v(prev) : v)), []);

  const load = useCallback(async () => {
    if (!local?.device) return;
    try {
      const r = await fetch('/api/photos?device=' + encodeURIComponent(local.device), { cache: 'no-store' });
      setPhotos((await r.json()).photos || []);
    } catch { setPhotos((p) => p || []); }
  }, [local?.device, setPhotos]);

  useEffect(() => { load(); }, [load]);

  const call = useCallback(async (action, payload, okMsg) => {
    try {
      const r = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, device: local.device, name: local.name, ...payload }),
      });
      const j = await r.json().catch(() => ({ error: 'De foto is te groot.' }));
      if (!r.ok) { toast(j.error || 'Dat lukte niet.'); return false; }
      setPhotos(j.photos);
      if (okMsg) toast(okMsg);
      return true;
    } catch {
      toast('Geen verbinding. Probeer het zo nog eens.');
      return false;
    }
  }, [local, toast, setPhotos]);

  return { photos, load, call };
}

// Verklein een foto in de browser tot max. 1600px en maak er een JPEG van (meestal 200–600 kB)
export async function shrink(file, max = 1600, quality = 0.82) {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => null);
  let src = bmp, w, h;
  if (bmp) { w = bmp.width; h = bmp.height; }
  else {
    src = await new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = () => rej(new Error('Deze foto kan niet worden gelezen.'));
      img.src = URL.createObjectURL(file);
    });
    w = src.naturalWidth; h = src.naturalHeight;
  }
  const scale = Math.min(1, max / Math.max(w, h));
  const cw = Math.round(w * scale), ch = Math.round(h * scale);
  const c = document.createElement('canvas');
  c.width = cw; c.height = ch;
  c.getContext('2d').drawImage(src, 0, 0, cw, ch);
  return { image: c.toDataURL('image/jpeg', quality), width: cw, height: ch };
}

// Vierkante profielfoto: midden uitsnijden en verkleinen tot 400×400 JPEG (± 40 kB)
export async function squareAvatar(file, size = 400) {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => null);
  let src = bmp, w, h;
  if (bmp) { w = bmp.width; h = bmp.height; }
  else {
    src = await new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = () => rej(new Error('Deze foto kan niet worden gelezen.'));
      img.src = URL.createObjectURL(file);
    });
    w = src.naturalWidth; h = src.naturalHeight;
  }
  const side = Math.min(w, h);
  // iets boven het midden: daar zit meestal het gezicht
  const sx = (w - side) / 2, sy = Math.max(0, (h - side) * 0.35);
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  c.getContext('2d').drawImage(src, sx, sy, side, side, 0, 0, size, size);
  return c.toDataURL('image/jpeg', 0.85);
}
