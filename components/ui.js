'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from './AppProvider';
import { dparts, TYPE_LABEL } from '@/lib/content';

export function Loading() {
  return (<><div className="skeleton" /><div className="skeleton" style={{ minHeight: 200 }} /></>);
}

export function ErrorNote() {
  const { error } = useApp();
  return error ? <p className="err">{error}</p> : null;
}

// Wacht tot de gegevens er zijn
export function useReady() {
  const { data, local } = useApp();
  return Boolean(data && local);
}

export function EventRow({ e, noTag }) {
  const { data } = useApp();
  const p = dparts(e.date);
  const going = Boolean(data?.mine?.[e.id]);
  const n = data?.counts?.[e.id] || 0;
  const rides = (data?.rides?.[e.id] || []).length;
  return (
    <Link className="row" href={'/event/' + e.id}>
      <span className="date"><span className="d">{p.d}</span><span className="m">{p.w} {p.m}</span></span>
      <span style={{ minWidth: 0 }}>
        <span className="t">{!noTag && <span className={'tag ' + e.type}>{TYPE_LABEL[e.type]}</span>}{e.title}</span><br />
        <span className="s">
          {e.type === 'wedstrijd'
            ? <>📍 {e.place}{e.km != null ? ` (${e.km} km)` : ''}{e.distances ? <><br />🏃 {e.distances}</> : ''}</>
            : e.type === 'samenloop'
            ? <>{e.time} · {(e.place || '').split(',')[0]}<br /><span className="run-tags"><span>{e.distances}</span><span>{e.details?.pace}</span></span> door {e.organizer?.name?.split(' ')[0]}</>
            : <>{e.time ? e.time + ' · ' : ''}{(e.place || '').split(',')[0]}</>}
          {going ? <b style={{ color: 'var(--ok)' }}> · {e.type === 'wedstrijd' ? (n > 1 ? `jij + ${n - 1} doen mee` : 'je doet mee') : 'je bent erbij'}</b> : n > 0 ? ` · ${n} ${e.type === 'training' || e.type === 'samenloop' ? (n === 1 ? 'loper' : 'lopers') : e.type === 'wedstrijd' ? (n === 1 ? 'doet mee' : 'doen mee') : 'aangemeld'}` : null}
          {rides > 0 ? ` · ${rides} ${rides === 1 ? 'rit' : 'ritten'}` : null}
        </span>
      </span>
      <span className="chev">›</span>
    </Link>
  );
}

export function Switch({ id, checked, onChange, label }) {
  return (
    <label className="switch">
      <input type="checkbox" id={id} checked={checked} onChange={(e) => onChange(e.target.checked)} aria-label={label} />
      <span />
    </label>
  );
}

export function AttendButton({ e, going, act, local, long }) {
  const label = going ? (long ? '✓ Je bent erbij · tik om af te melden' : '✓ Je bent erbij') : 'Ik ben erbij';
  return (
    <button
      className={'btn ' + (going ? 'btn-done' : 'btn-gold')}
      onClick={() => {
        if (!going && !local.name) { location.href = '/profiel?terug=1'; return; }
        act('participate', { eventId: e.id, on: !going }, going ? 'Afgemeld' : 'Je staat op de lijst. Tot dan!');
      }}
    >{label}</button>
  );
}

// Foto bovenaan een pagina met de titel erop
export function PhotoHeader({ src, title, sub, pos = 'center 40%' }) {
  return (
    <header className="photo-header" style={{ backgroundImage: `url("${src}")`, backgroundPosition: pos }}>
      <h1>{title}</h1>
      {sub && <p>{sub}</p>}
    </header>
  );
}

// Ronde profielfoto, of de beginletters als er geen foto is
export function Avatar({ name = '', src, size = 36, className = '' }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
  return src
    // eslint-disable-next-line @next/next/no-img-element
    ? <img className={'avatar ' + className} src={src} alt="" width={size} height={size} style={{ width: size, height: size }} loading="lazy" />
    : <span className={'avatar initials ' + className} style={{ width: size, height: size, fontSize: size * 0.38 }} aria-hidden="true">{initials}</span>;
}

// Rij gezichten met naam; tik op een gezicht voor de ledenkaart
export function People({ list }) {
  const [open, setOpen] = useState(null);
  if (!list?.length) return null;
  return (
    <>
      <ul className="faces">
        {list.map((p, i) => (
          <li key={i} className={p.me ? 'me' : ''}>
            <button type="button" onClick={() => setOpen(p)} aria-label={'Bekijk ' + p.name}>
              <Avatar name={p.name} src={p.avatar} size={52} />
              <span>{(p.name || '').split(' ')[0]}</span>
            </button>
          </li>
        ))}
      </ul>
      {open && <MemberSheet p={open} onClose={() => setOpen(null)} />}
    </>
  );
}

const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
export const sinceLabel = (v) => (/^\d{4}-\d{2}$/.test(v || '') ? `${MONTHS[+v.slice(5) - 1]} ${v.slice(0, 4)}` : '');

export const QUESTIONS = [
  ['since', 'Lid sinds'],
  ['best', 'Mooiste hardloopervaring'],
  ['song', 'Favoriete hardloopnummer'],
  ['work', 'Werk'],
  ['fact', 'Wat mensen over me zou verbazen'],
];

// Ledenkaart: grote foto en antwoorden op de vragen
export function MemberSheet({ p, onClose }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  const answers = QUESTIONS.map(([k, q]) => [q, k === 'since' ? sinceLabel(p.since) : p[k]]).filter(([, a]) => a);
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={p.name} onClick={(e) => e.stopPropagation()}>
        <div className="who">
          <Avatar name={p.name} src={p.avatar} size={220} />
          <h2>{p.name}</h2>
        </div>
        {answers.length
          ? <dl className="qa">{answers.map(([q, a]) => <div key={q}><dt>{q}</dt><dd>{a}</dd></div>)}</dl>
          : <p className="muted" style={{ textAlign: 'center' }}>{p.me ? 'Vul de vragen in bij je profiel, dan leren anderen je kennen.' : 'Nog geen antwoorden ingevuld.'}</p>}
        <button className="btn btn-line" onClick={onClose}>Sluiten</button>
      </div>
    </div>
  );
}
