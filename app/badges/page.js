'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import { Loading } from '@/components/ui';
import Badge from '@/components/Badge';
import { UnlockSheet } from '@/components/BadgeUnlock';
import { useBadges } from '@/lib/useBadges';
import { BADGES, CATEGORIES, TIERS, nextBadge } from '@/lib/badges';

const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
const dayLabel = (iso, long) => {
  if (!iso) return '';
  const d = new Date(iso.slice(0, 10) + 'T12:00:00Z');
  return long
    ? d.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    : `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
};

export default function Badges() {
  const { local } = useApp();
  const [demo, setDemo] = useState(false);
  const [filter, setFilter] = useState('alles');
  const [open, setOpen] = useState(null);
  const [unlock, setUnlock] = useState(null);
  const [msg, setMsg] = useState('');
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    setDemo(q.has('demo'));
    if (q.get('strava') === 'ok') setMsg('Strava gekoppeld! Je loopjes zijn doorzocht.');
    else if (q.get('strava')) setMsg('Koppelen lukte niet. ' + (q.get('why') || ''));
  }, []);
  const { state, busy, sync } = useBadges({ demo });
  const [note, setNote] = useState('');

  const list = state?.badges || [];
  const earned = list.filter((b) => b.earned);
  const next = useMemo(() => nextBadge(list), [list]);
  const shown = filter === 'alles' ? list : list.filter((b) => b.cat === filter);
  const sorted = [...shown].sort((a, b) => Number(b.earned) - Number(a.earned));

  if (!local || !state) return <Loading />;

  return (
    <>
      <div className="section-head">
        <h1>Mijn badges</h1>
        <span className="badge-count num">{earned.length} / {BADGES.length}</span>
      </div>
      {state.demo && <p className="note"><b>Voorbeeld.</b> Zo ziet het eruit met een paar maanden trainingen en de Backyard Run. <button className="link" onClick={() => setUnlock(earned.slice(0, 3))}>Bekijk het unlock-moment ›</button></p>}
      {msg && <p className={msg.startsWith('Strava gekoppeld') ? 'note' : 'err'}>{msg}</p>}
      {state.setup && <p className="err">{state.setup}</p>}
      {note && <p className="note">{note}</p>}

      {next && (
        <button type="button" className="panel badge-next" onClick={() => setOpen(next)}>
          <Badge b={next} size={64} locked />
          <span className="badge-next-body">
            <span className="eyebrow">Volgende badge</span>
            <b>{next.name}</b>
            <span className="badge-bar"><i style={{ width: `${Math.round((next.have / next.need) * 100)}%` }} /></span>
            <span className="small muted">{next.have} van {next.need} · nog {next.need - next.have} te gaan</span>
          </span>
        </button>
      )}

      <section className="panel section">
        <div className="section-head"><h3>Jouw dinsdagen</h3><span className="small muted">laatste 10</span></div>
        <ol className="tues">
          {state.tuesdays.map((t) => (
            <li key={t.date} className={t.went ? 'on' : ''} title={`${dayLabel(t.date)} · ${t.kind}${t.went ? '' : ' · niet geteld'}`}>
              <span className="dot">{t.went ? (state.sources['training-' + t.date] === 'checkin' ? '✓' : '') : ''}</span>
              <span className="d">{t.date.slice(8).replace(/^0/, '')}</span>
            </li>
          ))}
        </ol>
        {state.connected
          ? <div className="btn-row" style={{ alignItems: 'center' }}>
              <span className="small muted" style={{ flex: 1 }}>Strava gekoppeld. Je loopjes tellen vanzelf mee.</span>
              {!state.demo && <button className="btn btn-line btn-sm" disabled={busy} onClick={async () => { try { const j = await sync(true); setNote(j?.note || 'Bijgewerkt'); } catch (e) { setNote(e.message); } }}>{busy ? 'Bezig…' : 'Nu bijwerken'}</button>}
            </div>
          : <div className="section" style={{ gap: 8 }}>
              <p className="small">Koppel Strava, dan tellen je trainingen vanzelf mee. Ook die van vroeger, zoals de Backyard Run en afgelopen dinsdag.</p>
              {state.configured && <a className="btn btn-strava" href={'/api/strava/connect?next=badges&device=' + encodeURIComponent(local.device)}>Koppel met Strava</a>}
              <p className="small muted">Geen Strava? Meld je aan met &ldquo;Ik ben erbij&rdquo; en tik op de avond zelf op &ldquo;Ik was erbij&rdquo;.</p>
            </div>}
      </section>

      <div className="chips" role="group" aria-label="Filter badges">
        {[['alles', 'Alles'], ...CATEGORIES.map(([k, t]) => [k, t.split(' ')[0]])].map(([k, t]) => (
          <button key={k} type="button" className={'chip' + (filter === k ? ' on' : '')} aria-pressed={filter === k} onClick={() => setFilter(k)}>{k === '5k' ? '5K' : t}</button>
        ))}
      </div>

      <div className="badge-grid">
        {sorted.map((b) => (
          <button key={b.id} type="button" className={'badge-cell' + (b.earned ? '' : ' locked')} onClick={() => setOpen(b)}>
            <Badge b={b} size={88} locked={!b.earned} />
            <span>{b.name}</span>
          </button>
        ))}
      </div>

      <details className="panel how">
        <summary><b>Hoe tellen badges?</b></summary>
        <ul className="small">
          <li><b>Met Strava:</b> een loopje op dinsdag rond de trainingstijd, in Bennekom, telt automatisch als clubtraining. Events tellen op dezelfde manier op hun eigen dag.</li>
          <li><b>Zonder Strava:</b> meld je aan met &ldquo;Ik ben erbij&rdquo; en tik op de avond zelf op &ldquo;Ik was erbij&rdquo;.</li>
          <li>Alleen aanmelden telt niet: de badge komt pas als je er echt was.</li>
          <li>Interval of duurloop haalt de app uit het trainingsschema.</li>
          <li>Sommige badges, zoals Haas, kent de club zelf toe.</li>
          <li>Je badges en Strava-gegevens ziet alleen jij.</li>
        </ul>
      </details>
      <p className="proto"><Link href="/profiel">Terug naar je profiel</Link></p>

      {open && <BadgeSheet b={open} tuesdays={state.tuesdays} onClose={() => setOpen(null)} />}
      {unlock && <UnlockSheet list={unlock} onClose={() => setUnlock(null)} />}
    </>
  );
}

function BadgeSheet({ b, tuesdays, onClose }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  const t = TIERS[b.tier];
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet badge-sheet" role="dialog" aria-modal="true" aria-label={b.name} onClick={(e) => e.stopPropagation()}>
        <div className={b.earned ? 'unlock-glow tier-' + b.tier : ''}><Badge b={b} size={180} locked={!b.earned} /></div>
        <span className="tier-chip" style={{ '--c': t.c1 }}><i />{t.name}{b.cat === 'events' ? ' · eenmalig' : ''}</span>
        <h2>{b.name}</h2>
        <p className="muted">{b.crit}</p>
        {b.earned
          ? <p><b>Behaald</b> {b.date ? 'op ' + dayLabel(b.date, true) : ''}</p>
          : b.need > 1 && b.have != null
            ? <div className="section" style={{ gap: 6, width: '100%' }}>
                <span className="badge-bar"><i style={{ width: `${Math.round((b.have / b.need) * 100)}%` }} /></span>
                <span className="small muted">{b.have} van {b.need}</span>
              </div>
            : <p className="small muted">Nog niet behaald.</p>}
        {b.id === 'ijzeren-reeks' && tuesdays && (
          <ol className="tues">
            {tuesdays.map((x) => <li key={x.date} className={x.went ? 'on' : ''}><span className="dot" /><span className="d">{x.date.slice(8).replace(/^0/, '')}</span></li>)}
          </ol>
        )}
        <button className="btn btn-line" onClick={onClose}>Sluiten</button>
      </div>
    </div>
  );
}
