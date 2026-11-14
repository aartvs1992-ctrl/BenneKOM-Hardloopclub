'use client';
// Eén badge als SVG. Vorm per categorie, kleur per zeldzaamheid; op slot = grijs.
import { useId } from 'react';
import { TIERS } from '@/lib/badges';

const ICONS = {
  bolt: 'M13 2 L4 14 H11 L10 22 L20 9 H13 Z',
  wave: 'M2 9 C5 5 8 5 11 9 C14 13 17 13 22 9 M2 15 C5 11 8 11 11 15 C14 19 17 19 22 15',
  flame: 'M12 2 C13 6 18 8.5 18 14 A6 6 0 0 1 6 14 C6 11 7.5 9.5 9 8 C9 10 10 11 11 11.5 C10.5 8 11 5 12 2 Z',
  snow: 'M12 2 V22 M3.3 7 L20.7 17 M3.3 17 L20.7 7 M9 3.5 L12 6 L15 3.5 M9 20.5 L12 18 L15 20.5',
  star: 'M12 2 L15 9 L22 9.5 L16.5 14 L18.5 21 L12 17 L5.5 21 L7.5 14 L2 9.5 L9 9 Z',
  stopwatch: 'M12 9 V14 L15 16 M9 2 H15 M12 2 V5 M20 14 A8 8 0 1 1 4 14 A8 8 0 1 1 20 14 Z',
  mountain: 'M2 20 L9 7 L13 13.5 L16 9 L22 20 Z M7.2 10.4 L9 12 L10.6 10',
  flag: 'M5 22 V3 M5 4 H18 L15 8.5 L18 13 H5',
  crown: 'M3 17 L4.5 6 L9.5 10.5 L12 3 L14.5 10.5 L19.5 6 L21 17 Z M3 21 H21',
  loop: 'M20 12 A8 8 0 1 1 17.7 6.3 M20 3 V7 H16',
  drop: 'M12 1.5 C15.5 6.5 17.5 9.5 17.5 12.5 A5.5 5.5 0 0 1 6.5 12.5 C6.5 9.5 8.5 6.5 12 1.5 Z M2 21 C4 19.5 6 19.5 8 21 C10 22.5 12 22.5 14 21 C16 19.5 18 19.5 22 21',
  pasta: 'M3 12 H21 C21 17 17 20 12 20 C7 20 3 17 3 12 Z M8 12 C8 8 10 6 9 3 M12 12 C12 8 14 6 13 3 M16 12 C16 8 18 6 17 3',
  chain: 'M9 15 L15 9 M10.5 6.5 L12.5 4.5 A4 4 0 0 1 19.5 11.5 L17.5 13.5 M13.5 17.5 L11.5 19.5 A4 4 0 0 1 4.5 12.5 L6.5 10.5',
  calendar: 'M4 6 H20 V20 H4 Z M4 10 H20 M8 3 V7 M16 3 V7 M8 14 H10 M14 14 H16 M8 17 H10 M14 17 H16',
  week: 'M4 6 H20 V20 H4 Z M4 10 H20 M8 3 V7 M16 3 V7 M8.5 15 L11 17.5 L15.5 13',
  road: 'M8 2 L4 22 M16 2 L20 22 M12 3 V6 M12 10 V13 M12 17 V20',
  repeat: 'M4 10 A8 8 0 0 1 18 6 M20 3 V7 H16 M20 14 A8 8 0 0 1 6 18 M4 21 V17 H8',
  rocket: 'M12 2 C16 5 17 10 15 15 H9 C7 10 8 5 12 2 Z M9 15 L6 19 L9 18.5 M15 15 L18 19 L15 18.5 M12 7.5 A1.5 1.5 0 1 0 12 10.5 A1.5 1.5 0 1 0 12 7.5',
  tree: 'M12 2 L6.5 9.5 H9.5 L5 15.5 H10.5 V21 H13.5 V15.5 H19 L14.5 9.5 H17.5 Z',
  heart: 'M12 21 C5 15 2 11 2 7.5 A4.5 4.5 0 0 1 12 6 A4.5 4.5 0 0 1 22 7.5 C22 11 19 15 12 21 Z',
};
const INK = '#0A1A33';

export default function Badge({ b, size = 96, locked = false }) {
  const uid = useId().replace(/:/g, '');
  const t = locked ? { c1: '#7C8596', c2: '#3A4456' } : TIERS[b.tier];
  const ink = locked ? '#1B2433' : INK;
  const g = `bg${uid}`, f = `bf${uid}`;
  const fill = `url(#${g})`;
  const legend = b.tier === 'legend' && !locked;
  const num = b.num || '';
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} overflow="visible" role="img" aria-label={b.name + (locked ? ' (nog niet behaald)' : '')} className={'badge-svg' + (locked ? ' locked' : '')}>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={t.c1} /><stop offset="1" stopColor={t.c2} /></linearGradient>
        <filter id={f} x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      {legend && <circle cx="60" cy="60" r="54" fill={t.c1} opacity="0.45" filter={`url(#${f})`} />}
      {b.shape === 'medal' && <>
        <circle cx="60" cy="60" r="57" fill={fill} />
        <circle cx="60" cy="60" r="52.5" fill="none" stroke={ink} strokeWidth="1.2" strokeDasharray="1.5 3" opacity="0.6" />
        <circle cx="60" cy="60" r="47" fill={ink} stroke={t.c2} strokeWidth="1.5" />
      </>}
      {b.shape === 'hex' && <>
        <polygon points="60,3 110,31.5 110,88.5 60,117 10,88.5 10,31.5" fill={fill} />
        <polygon points="60,14 100,37 100,83 60,106 20,83 20,37" fill={ink} stroke={t.c2} strokeWidth="1.5" />
      </>}
      {b.shape === 'shield' && <>
        <path d="M60 3 L109 17 V58 C109 89 87 107 60 117 C33 107 11 89 11 58 V17 Z" fill={fill} />
        <path d="M60 13 L99 24.5 V58 C99 83 81 98 60 106.5 C39 98 21 83 21 58 V24.5 Z" fill={ink} stroke={t.c2} strokeWidth="1.5" />
      </>}
      {b.shape === 'burst' && <>
        <polygon points="60.0,2.0 69.8,11.0 82.2,6.4 87.8,18.4 101.0,19.0 101.6,32.2 113.6,37.8 109.0,50.2 118.0,60.0 109.0,69.8 113.6,82.2 101.6,87.8 101.0,101.0 87.8,101.6 82.2,113.6 69.8,109.0 60.0,118.0 50.2,109.0 37.8,113.6 32.2,101.6 19.0,101.0 18.4,87.8 6.4,82.2 11.0,69.8 2.0,60.0 11.0,50.2 6.4,37.8 18.4,32.2 19.0,19.0 32.2,18.4 37.8,6.4 50.2,11.0" fill={fill} />
        <circle cx="60" cy="60" r="45" fill={ink} stroke={t.c2} strokeWidth="1.5" />
        <circle cx="60" cy="60" r="40" fill="none" stroke={t.c1} strokeWidth="0.8" strokeDasharray="2 2.5" opacity="0.5" />
      </>}
      {b.shape === 'diamond' && <>
        <rect x="18" y="18" width="84" height="84" rx="16" transform="rotate(45 60 60)" fill={fill} />
        <rect x="27" y="27" width="66" height="66" rx="11" transform="rotate(45 60 60)" fill={ink} stroke={t.c2} strokeWidth="1.5" />
      </>}
      {num
        ? <text x="60" y="71" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="800" fontStyle="italic" fontSize={num.length >= 3 ? 34 : 42} fill={t.c1}>{num}</text>
        : <g transform="translate(41 34) scale(1.5833)"><path d={ICONS[b.icon]} fill="none" stroke={t.c1} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></g>}
      <rect x="25" y="83" width="70" height="16" rx="3" fill={ink} stroke={fill} strokeWidth="1.5" />
      <text x="60" y="94.6" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="700" fontSize="10" letterSpacing="1.4" fill={t.c1}>{b.tag}</text>
    </svg>
  );
}
