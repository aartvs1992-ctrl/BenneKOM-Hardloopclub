'use client';
import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/components/AppProvider';
import { Loading } from '@/components/ui';
import { usePhotos, shrink } from '@/lib/usePhotos';
import { CLUB_PHOTOS } from '@/lib/club';
import { MON } from '@/lib/content';

function when(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d) / 864e5);
  if (days === 0) return 'vandaag';
  if (days === 1) return 'gisteren';
  if (days < 7) return days + ' dagen geleden';
  return `${d.getDate()} ${MON[d.getMonth()]}`;
}

export default function Fotos() {
  const { local, toast } = useApp();
  const { photos, call } = usePhotos();
  const [draft, setDraft] = useState(null); // { image, width, height, caption }
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(null);
  const input = useRef(null);

  if (!local || !photos) return <Loading />;

  // Clubfoto's van de website staan achteraan, als vaste basis van de wall
  const club = CLUB_PHOTOS.map((p, i) => ({ id: 'club-' + i, url: p.src, caption: p.caption, name: 'BenneKOM', club: true, width: p.w, height: p.h }));
  const wall = [...photos, ...club];

  async function pick(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!local.name) { location.href = '/meer?naam=1'; return; }
    try {
      setDraft({ ...(await shrink(file)), caption: '' });
    } catch {
      toast('Deze foto kan niet worden gelezen. Probeer een andere.');
    }
  }

  async function post(e) {
    e.preventDefault();
    setBusy(true);
    const ok = await call('upload', { image: draft.image, width: draft.width, height: draft.height, caption: draft.caption }, 'Foto geplaatst!');
    setBusy(false);
    if (ok) setDraft(null);
  }

  return (
    <>
      <div className="section-head"><h1>Foto&apos;s</h1><span className="small muted num">{wall.length} foto&apos;s</span></div>
      <p className="muted">Deel je mooiste moment van een training, wedstrijd of de 5km Challenge.</p>

      <input ref={input} type="file" accept="image/*" hidden onChange={pick} id="photo-input" />
      {!draft && <button className="btn btn-gold" onClick={() => input.current.click()}>+ Foto plaatsen</button>}

      {draft && (
        <form className="panel" onSubmit={post}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={draft.image} alt="Voorbeeld van je foto" className="draft-img" />
          <div className="field"><label htmlFor="ph-cap">Bijschrift (optioneel)</label>
            <input className="input" id="ph-cap" maxLength={140} value={draft.caption} onChange={(e) => setDraft({ ...draft, caption: e.target.value })} placeholder="Bijv. Intervallen in de Kraats" /></div>
          <p className="note">Plaats alleen foto&apos;s waarop iedereen het goedvindt om in de app te staan.</p>
          <div className="btn-row">
            <button className="btn btn-gold" type="submit" disabled={busy}>{busy ? 'Bezig met plaatsen…' : 'Plaatsen'}</button>
            <button className="btn btn-line" type="button" onClick={() => setDraft(null)} disabled={busy}>Annuleren</button>
          </div>
        </form>
      )}

      {wall.length ? (
        <div className="wall">
          {wall.map((p, i) => (
            <button key={p.id} className="wall-item" onClick={() => setOpen(i)} aria-label={p.caption || 'Foto van ' + p.name}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.caption || ''} loading="lazy" style={p.width && p.height ? { aspectRatio: `${p.width} / ${p.height}` } : undefined} />
              {p.likes > 0 && <span className="wall-likes">👍 {p.likes}</span>}
            </button>
          ))}
        </div>
      ) : (
        <div className="panel empty">
          <h3>Nog geen foto&apos;s</h3>
          <p className="muted">Plaats de eerste foto van BenneKOM. Na de dinsdagtraining is een groepsfoto altijd goed.</p>
        </div>
      )}

      {open !== null && wall[open] && (
        <Lightbox
          p={wall[open]}
          onClose={() => setOpen(null)}
          onPrev={open > 0 ? () => setOpen(open - 1) : null}
          onNext={open < wall.length - 1 ? () => setOpen(open + 1) : null}
          onLike={(p) => call('like', { id: p.id, on: !p.liked })}
          onDelete={async (p) => { if (await call('delete', { id: p.id }, 'Foto verwijderd')) setOpen(null); }}
        />
      )}
    </>
  );
}

function Lightbox({ p, onClose, onPrev, onNext, onLike, onDelete }) {
  const [sure, setSure] = useState(false);
  useEffect(() => { setSure(false); }, [p.id]);
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowLeft' && onPrev) onPrev(); if (e.key === 'ArrowRight' && onNext) onNext(); };
    window.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [onClose, onPrev, onNext]);

  // vegen naar links/rechts
  const start = useRef(null);
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Foto"
      onTouchStart={(e) => { start.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - (start.current ?? 0); if (dx > 60 && onPrev) onPrev(); if (dx < -60 && onNext) onNext(); }}>
      <button className="lb-close" onClick={onClose} aria-label="Sluiten">×</button>
      <div className="lb-img" onClick={onClose}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.url} alt={p.caption || ''} onClick={(e) => e.stopPropagation()} />
        {onPrev && <button className="lb-nav prev" onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label="Vorige">‹</button>}
        {onNext && <button className="lb-nav next" onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Volgende">›</button>}
      </div>
      <div className="lb-bar">
        <div style={{ minWidth: 0 }}>
          {p.caption && <p className="lb-cap">{p.caption}</p>}
          <p className="lb-meta">{p.name}{p.created_at ? ' · ' + when(p.created_at) : ''}</p>
        </div>
        {!p.club && (
          <div className="btn-row" style={{ flexWrap: 'nowrap' }}>
            <button className={'btn btn-sm ' + (p.liked ? 'btn-gold' : 'btn-ghost')} onClick={() => onLike(p)} aria-pressed={p.liked}>👍 {p.likes || ''}</button>
            {p.mine && (sure
              ? <button className="btn btn-sm btn-danger" onClick={() => onDelete(p)}>Zeker verwijderen?</button>
              : <button className="btn btn-sm btn-ghost" onClick={() => setSure(true)}>Verwijderen</button>)}
          </div>
        )}
      </div>
    </div>
  );
}
