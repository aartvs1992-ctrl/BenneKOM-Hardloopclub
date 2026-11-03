'use client';
import { useState } from 'react';

// Fotoraster; tik op een foto om hem groot te bekijken
export function Gallery({ photos }) {
  const [open, setOpen] = useState(null);
  return (
    <>
      <div className="gallery">
        {photos.map((p, i) => (
          <button key={p.src} className={'g-item' + (i === 0 || (i === photos.length - 1 && photos.length % 2 === 0) ? ' wide' : '')} onClick={() => setOpen(i)} aria-label={p.caption || 'Foto vergroten'}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt={p.caption || ''} loading="lazy" />
          </button>
        ))}
      </div>
      {open != null && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setOpen(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[open].src} alt={photos[open].caption || ''} />
          {photos[open].caption && <span className="cap">{photos[open].caption}</span>}
          <div className="lb-nav" onClick={(e) => e.stopPropagation()}>
            <button className="btn btn-line btn-sm" onClick={() => setOpen((open + photos.length - 1) % photos.length)} aria-label="Vorige">‹</button>
            <button className="btn btn-line btn-sm" onClick={() => setOpen(null)}>Sluiten</button>
            <button className="btn btn-line btn-sm" onClick={() => setOpen((open + 1) % photos.length)} aria-label="Volgende">›</button>
          </div>
        </div>
      )}
    </>
  );
}
