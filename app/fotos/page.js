'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '@/components/AppProvider';
import { Loading, PhotoHeader } from '@/components/ui';
import { usePhotos, shrink } from '@/lib/usePhotos';
import { CLUB_PHOTOS, clubAlbum, todayISO } from '@/lib/club';
import { MON } from '@/lib/content';

const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const dayLabel = (iso) => { const d = new Date(iso + 'T12:00:00Z'); return `${d.getUTCDate()} ${MON[d.getUTCMonth()]}`; };
const monthLabel = (iso) => { const d = new Date(iso + 'T12:00:00Z'); return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

function when(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d) / 864e5);
  if (days === 0) return 'vandaag';
  if (days === 1) return 'gisteren';
  if (days < 7) return days + ' dagen geleden';
  return `${d.getDate()} ${MON[d.getMonth()]}`;
}

// De laatste dinsdagen, om een foto aan een training te koppelen
function recentTuesdays(n = 4) {
  let d = todayISO();
  while (new Date(d + 'T12:00:00Z').getUTCDay() !== 2) d = addDays(d, -1);
  return Array.from({ length: n }, (_, i) => addDays(d, -7 * i));
}

// Bij welk moment hoort een foto? Met album: dat moment. Zonder: de maand.
function groupOf(p) {
  if (p.album) return { key: 'a:' + p.album + '|' + (p.date || ''), label: p.album + (p.date ? ' · ' + dayLabel(p.date) : ''), date: p.date || '0000' };
  const m = (p.date || '').slice(0, 7);
  return { key: 'm:' + m, label: m ? monthLabel(m + '-15') : 'Overig', date: m ? m + '-01' : '0000' };
}

export default function Fotos() {
  const { local, toast } = useApp();
  const { photos, call } = usePhotos();
  const [draft, setDraft] = useState(null); // { image, width, height, caption, moment, other, date }
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(null);
  const [filter, setFilter] = useState('all');
  const input = useRef(null);

  const wall = useMemo(() => {
    if (!photos) return [];
    const own = photos.map((p) => ({ ...p, date: p.taken_on || String(p.created_at || '').slice(0, 10) }));
    // Clubfoto's staan achteraan, als vaste basis van de wall
    const club = CLUB_PHOTOS.map((p, i) => ({ id: 'club-' + i, url: p.src, caption: p.caption, name: 'BenneKOM', club: true, width: p.w, height: p.h, ...(({ album, date }) => ({ album, date }))(clubAlbum(p.src)) }));
    return [...own, ...club].map((p) => ({ ...p, group: groupOf(p) }));
  }, [photos]);

  const groups = useMemo(() => {
    const m = new Map();
    for (const p of wall) {
      const g = m.get(p.group.key) || { ...p.group, n: 0 };
      g.n++; m.set(p.group.key, g);
    }
    return [...m.values()].sort((a, b) => b.date.localeCompare(a.date));
  }, [wall]);

  if (!local || !photos) return <Loading />;

  const shown = filter === 'all' ? wall : filter === 'mine' ? wall.filter((p) => p.mine) : wall.filter((p) => p.group.key === filter);
  const hasMine = wall.some((p) => p.mine);
  const tuesdays = recentTuesdays();

  async function pick(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!local.name) { location.href = '/profiel?terug=1'; return; }
    try {
      setDraft({ ...(await shrink(file, 2400, 0.85)), caption: '', moment: '', other: '', date: todayISO() });
    } catch {
      toast('Deze foto kan niet worden gelezen. Probeer een andere.');
    }
  }

  async function post(e) {
    e.preventDefault();
    setBusy(true);
    let album = '', date = draft.date;
    if (draft.moment.startsWith('training:')) { album = 'Dinsdagtraining'; date = draft.moment.slice(9); }
    else if (draft.moment === 'other') album = draft.other.trim();
    else if (draft.moment) album = draft.moment;
    const ok = await call('upload', { image: draft.image, width: draft.width, height: draft.height, caption: draft.caption, album, taken_on: date }, 'Foto geplaatst!');
    setBusy(false);
    if (ok) setDraft(null);
  }

  return (
    <>
      <PhotoHeader src="/club/de-hele-groep.jpg" title="Foto's" sub={`${wall.length} foto's van de club. Deel ook jouw mooiste moment.`} pos="center 45%" />

      <input ref={input} type="file" accept="image/*" hidden onChange={pick} id="photo-input" />
      {!draft && <button className="btn btn-gold" onClick={() => input.current.click()}>+ Foto plaatsen</button>}

      {draft && (
        <form className="panel" onSubmit={post}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={draft.image} alt="Voorbeeld van je foto" className="draft-img" />
          <div className="field"><label htmlFor="ph-moment">Bij welk moment hoort deze foto?</label>
            <select className="input" id="ph-moment" value={draft.moment} onChange={(e) => setDraft({ ...draft, moment: e.target.value })}>
              <option value="">Geen specifiek moment</option>
              {tuesdays.map((t) => <option key={t} value={'training:' + t}>Dinsdagtraining · {dayLabel(t)}</option>)}
              <option value="5km Challenge">5km Challenge</option>
              <option value="Samen lopen">Samen lopen (loopje buiten de dinsdag)</option>
              <option value="other">Wedstrijd of special (vul in)…</option>
            </select>
          </div>
          {draft.moment === 'other' && (
            <div className="field"><label htmlFor="ph-other">Naam van de wedstrijd of special</label>
              <input className="input" id="ph-other" maxLength={60} value={draft.other} onChange={(e) => setDraft({ ...draft, other: e.target.value })} placeholder="Bijv. Zevenheuvelenloop" /></div>
          )}
          {!draft.moment.startsWith('training:') && (
            <div className="field"><label htmlFor="ph-date">Datum</label>
              <input className="input" id="ph-date" type="date" max={todayISO()} value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></div>
          )}
          <div className="field"><label htmlFor="ph-cap">Bijschrift (optioneel)</label>
            <input className="input" id="ph-cap" maxLength={140} value={draft.caption} onChange={(e) => setDraft({ ...draft, caption: e.target.value })} placeholder="Bijv. Intervallen in de Kraats" /></div>
          <p className="note">Plaats alleen foto&apos;s waarop iedereen het goedvindt om in de app te staan.</p>
          <div className="btn-row">
            <button className="btn btn-gold" type="submit" disabled={busy || (draft.moment === 'other' && !draft.other.trim())}>{busy ? 'Bezig met plaatsen…' : 'Plaatsen'}</button>
            <button className="btn btn-line" type="button" onClick={() => setDraft(null)} disabled={busy}>Annuleren</button>
          </div>
        </form>
      )}

      {groups.length > 1 && (
        <div className="chips" role="tablist" aria-label="Filter foto's">
          <button className={'chip' + (filter === 'all' ? ' on' : '')} onClick={() => setFilter('all')}>Alles <span>{wall.length}</span></button>
          {hasMine && <button className={'chip' + (filter === 'mine' ? ' on' : '')} onClick={() => setFilter('mine')}>Mijn foto&apos;s</button>}
          {groups.map((g) => (
            <button key={g.key} className={'chip' + (filter === g.key ? ' on' : '')} onClick={() => setFilter(g.key)}>{g.label} <span>{g.n}</span></button>
          ))}
        </div>
      )}

      {shown.length ? (
        <div className="wall">
          {shown.map((p, i) => (
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

      {open !== null && shown[open] && (
        <Lightbox
          p={shown[open]}
          pos={`${open + 1} / ${shown.length}`}
          onClose={() => setOpen(null)}
          onPrev={open > 0 ? () => setOpen(open - 1) : null}
          onNext={open < shown.length - 1 ? () => setOpen(open + 1) : null}
          onLike={(p) => call('like', { id: p.id, on: !p.liked })}
          onDelete={async (p) => { if (await call('delete', { id: p.id }, 'Foto verwijderd')) setOpen(null); }}
        />
      )}
    </>
  );
}

// Foto met inzoomen: twee vingers (pinch), dubbeltik of dubbelklik, scrollwiel. Ingezoomd kun je slepen.
function ZoomImg({ src, alt, onSwipe, onTap }) {
  const [t, setT] = useState({ s: 1, x: 0, y: 0 });
  const g = useRef({});
  const box = useRef(null);
  useEffect(() => { setT({ s: 1, x: 0, y: 0 }); }, [src]);

  const clamp = (s, x, y) => {
    const r = box.current?.getBoundingClientRect();
    if (!r || s <= 1) return { s: 1, x: 0, y: 0 };
    const mx = (r.width * (s - 1)) / 2, my = (r.height * (s - 1)) / 2;
    return { s: Math.min(s, 5), x: Math.max(-mx, Math.min(mx, x)), y: Math.max(-my, Math.min(my, y)) };
  };
  const zoomAt = (cx, cy, s) => {
    const r = box.current.getBoundingClientRect();
    const px = cx - r.left - r.width / 2, py = cy - r.top - r.height / 2;
    setT((o) => clamp(s, px - ((px - o.x) * s) / o.s, py - ((py - o.y) * s) / o.s));
  };
  const dist = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

  function start(e) {
    const ts = e.touches;
    if (ts.length === 2) g.current = { pinch: dist(ts[0], ts[1]), s0: t.s, x0: t.x, y0: t.y, cx: (ts[0].clientX + ts[1].clientX) / 2, cy: (ts[0].clientY + ts[1].clientY) / 2 };
    else if (ts.length === 1) g.current = { ...g.current, pinch: 0, px: ts[0].clientX, py: ts[0].clientY, x0: t.x, y0: t.y, moved: false };
  }
  function move(e) {
    const ts = e.touches, s = g.current;
    if (ts.length === 2 && s.pinch) {
      e.preventDefault();
      const r = box.current.getBoundingClientRect();
      const ns = Math.max(1, Math.min(5, (s.s0 * dist(ts[0], ts[1])) / s.pinch));
      const px = s.cx - r.left - r.width / 2, py = s.cy - r.top - r.height / 2;
      setT(clamp(ns, px - ((px - s.x0) * ns) / s.s0, py - ((py - s.y0) * ns) / s.s0));
    } else if (ts.length === 1 && t.s > 1) {
      e.preventDefault();
      s.moved = true;
      setT(clamp(t.s, s.x0 + ts[0].clientX - s.px, s.y0 + ts[0].clientY - s.py));
    }
  }
  function end(e) {
    const s = g.current;
    if (e.touches.length || s.pinch) { if (!e.touches.length) g.current.pinch = 0; return; }
    const c = e.changedTouches[0], dx = c.clientX - s.px, dy = c.clientY - s.py;
    if (t.s === 1 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) { onSwipe(dx > 0 ? 'prev' : 'next'); return; }
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      const now = Date.now();
      if (now - (s.lastTap || 0) < 300) { s.lastTap = 0; clearTimeout(s.tapTimer); if (t.s > 1) setT({ s: 1, x: 0, y: 0 }); else zoomAt(c.clientX, c.clientY, 2.5); }
      else { s.lastTap = now; s.tapTimer = setTimeout(() => onTap?.(), 300); }
    }
  }

  return (
    <div className="zoom-box" ref={box}
      onTouchStart={start} onTouchMove={move} onTouchEnd={end}
      onDoubleClick={(e) => (t.s > 1 ? setT({ s: 1, x: 0, y: 0 }) : zoomAt(e.clientX, e.clientY, 2.5))}
      onWheel={(e) => zoomAt(e.clientX, e.clientY, Math.max(1, t.s * (e.deltaY < 0 ? 1.2 : 1 / 1.2)))}
      onMouseDown={(e) => { if (t.s > 1) { e.preventDefault(); g.current = { mx: e.clientX, my: e.clientY, x0: t.x, y0: t.y, drag: true }; } }}
      onMouseMove={(e) => { const s = g.current; if (s.drag) setT(clamp(t.s, s.x0 + e.clientX - s.mx, s.y0 + e.clientY - s.my)); }}
      onMouseUp={() => { g.current.drag = false; }} onMouseLeave={() => { g.current.drag = false; }}
      style={{ cursor: t.s > 1 ? 'grab' : 'zoom-in' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} draggable={false}
        style={{ transform: `translate(${t.x}px, ${t.y}px) scale(${t.s})`, transition: g.current.pinch || g.current.moved || g.current.drag ? 'none' : 'transform .18s ease-out' }} />
    </div>
  );
}

function Lightbox({ p, pos, onClose, onPrev, onNext, onLike, onDelete }) {
  const [sure, setSure] = useState(false);
  const [ui, setUi] = useState(true);
  useEffect(() => { setSure(false); }, [p.id]);
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowLeft' && onPrev) onPrev(); if (e.key === 'ArrowRight' && onNext) onNext(); };
    window.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [onClose, onPrev, onNext]);

  return (
    <div className={'lightbox' + (ui ? '' : ' lb-clean')} role="dialog" aria-modal="true" aria-label="Foto">
      <div className="lb-top">
        <span className="lb-pos">{pos}</span>
        <button className="lb-close" onClick={onClose} aria-label="Sluiten">×</button>
      </div>
      <div className="lb-img">
        <ZoomImg src={p.url} alt={p.caption || ''} onSwipe={(d) => (d === 'prev' ? onPrev?.() : onNext?.())} onTap={() => setUi((v) => !v)} />
        {onPrev && <button className="lb-nav prev" onClick={onPrev} aria-label="Vorige">‹</button>}
        {onNext && <button className="lb-nav next" onClick={onNext} aria-label="Volgende">›</button>}
      </div>
      <div className="lb-bar">
        <div style={{ minWidth: 0 }}>
          {p.caption && <p className="lb-cap">{p.caption}</p>}
          <p className="lb-meta">{p.name}{p.album ? ' · ' + p.album : ''}{p.club ? '' : p.created_at ? ' · ' + when(p.created_at) : ''}</p>
          <p className="lb-hint">Dubbeltik of knijp om in te zoomen</p>
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
