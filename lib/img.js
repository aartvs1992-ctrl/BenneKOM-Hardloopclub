// Kleinere versie van een foto laten maken door Vercel (/_next/image), passend bij hoe groot hij op het scherm staat.
// Een profielfoto van 30 px hoeft niet de volle 400×400 te laden, een fotostrook geen foto van 1600 px.
// Elke versie wordt een maand bewaard, dus Vercel maakt hem maar één keer.
// De breedtes moeten in next.config.mjs staan (imageSizes / deviceSizes).
const WIDTHS = [64, 128, 256, 384, 640, 828, 1200];

export function thumb(src, w = 384, q = 70) {
  if (!src || typeof src !== 'string') return src;
  // voorbeeld vóór uploaden, lokale testdata of al verkleind: zoals het is
  if (src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('/_next/')) return src;
  const local = src.startsWith('/');
  if (!local && !/^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\//.test(src)) return src;
  if (/\.(svg|gif|mp4|mov|webm)(\?|$)/i.test(src)) return src;
  const width = WIDTHS.find((x) => x >= w) || WIDTHS[WIDTHS.length - 1];
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${q}`;
}
