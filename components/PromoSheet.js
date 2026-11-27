'use client';
// Pop-up bij het openen van de app (hooguit één keer per week) om een evenement onder de aandacht te brengen (zie POPUP in lib/content.js).
// Alleen voor aangemelde leden die nog niet meedoen, en nooit tegelijk met een badge-scherm.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from './AppProvider';
import { Avatar } from './ui';
import { POPUP } from '@/lib/content';
import { todayISO } from '@/lib/club';

const KEY = 'bk-popup-seen';
const WEEK = 7 * 24 * 60 * 60 * 1000;
// Wanneer zag dit toestel de pop-up voor het laatst? { [id]: tijdstip }
const lastSeen = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || '{}'); return Array.isArray(v) ? {} : v; } catch { return null; } };
const due = (id) => { const m = lastSeen(); return m !== null && Date.now() - (m[id] || 0) >= WEEK; };
const markSeen = (id) => { try { localStorage.setItem(KEY, JSON.stringify({ ...(lastSeen() || {}), [id]: Date.now() })); } catch {} };

export default function PromoSheet() {
  const { data, local, act } = useApp();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const demo = typeof window !== 'undefined' && new URLSearchParams(location.search).has('popup');
  const p = POPUP;
  const ev = p && data?.events?.find((e) => e.id === p.event);
  const going = Boolean(ev && data?.mine?.[ev.id]);

  useEffect(() => {
    if (!p || !ev || !data?.me) return;
    if (!demo && (going || !due(p.id) || todayISO() > p.until || path.startsWith('/event/' + p.event))) return;
    let tries = 0;
    // even wachten, en niet tonen zolang er een badge-scherm openstaat
    const t = setInterval(() => {
      if (document.querySelector('.unlock-bg') && tries++ < 20) return;
      clearInterval(t);
      markSeen(p.id);
      setOpen(true);
    }, 2500);
    return () => clearInterval(t);
  }, [p, ev, data?.me, going, path, demo]);

  if (!open || !ev) return null;
  const close = () => setOpen(false);
  const n = data.counts?.[ev.id] || 0;
  const faces = (data.names?.[ev.id] || []).slice(0, 6);
  const left = ev.capacity ? ev.capacity - n : null;

  return (
    <div className="sheet-bg unlock-bg" onClick={close}>
      <div className="unlock popup" role="dialog" aria-modal="true" aria-label={p.title} onClick={(e) => e.stopPropagation()}>
        <button className="promo-x" onClick={close} aria-label="Sluiten">×</button>
        <p className="unlock-eyebrow">{p.eyebrow}</p>
        <h2 className="unlock-title promo-title">{p.title}</h2>
        <div className="promo-host">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.photo} alt={p.host} width={52} height={52} />
          <span><b>{p.host}</b><br /><span className="small">{p.hostRole}</span></span>
        </div>
        <p className="unlock-text promo-text">{p.text}</p>
        <ol className="promo-prog">{p.program.map((s) => <li key={s}>{s}</li>)}</ol>
        {n > 0 && (
          <div className="promo-going">
            <span className="stack">{faces.map((f, i) => <Avatar key={i} name={f.name} src={f.avatar} size={30} />)}</span>
            <span className="small">{n} {n === 1 ? 'clubgenoot gaat' : 'clubgenoten gaan'} al{left != null && left <= 15 ? ` · nog ${left} plekken` : ''}</span>
          </div>
        )}
        <div className="unlock-actions">
          {going
            ? <span className="btn btn-done">✓ Je bent erbij</span>
            : <button className="btn btn-gold" onClick={async () => { if (!local?.name) { location.href = '/profiel?terug=1'; return; } await act('participate', { eventId: ev.id, on: true }, 'Top, je staat op de lijst! 🥶'); close(); }}>Ik ben erbij</button>}
          <Link className="btn btn-line" href={'/event/' + ev.id} onClick={close}>Bekijk het hele programma</Link>
        </div>
      </div>
    </div>
  );
}
