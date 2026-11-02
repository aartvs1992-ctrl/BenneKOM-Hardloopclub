'use client';
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

export function EventRow({ e }) {
  const { data } = useApp();
  const p = dparts(e.date);
  const going = Boolean(data?.mine?.[e.id]);
  return (
    <Link className="row" href={'/event/' + e.id}>
      <span className="date"><span className="d">{p.d}</span><span className="m">{p.w} {p.m}</span></span>
      <span style={{ minWidth: 0 }}>
        <span className="t"><span className={'tag ' + e.type}>{TYPE_LABEL[e.type]}</span>{e.title}</span><br />
        <span className="s">
          {e.time ? e.time + ' · ' : ''}{e.place}
          {going ? <b style={{ color: 'var(--ok)' }}> · je bent erbij</b> : null}
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
        if (!going && !local.name) { location.href = '/meer?naam=1'; return; }
        act('participate', { eventId: e.id, on: !going }, going ? 'Afgemeld' : 'Je staat op de lijst. Tot dan!');
      }}
    >{label}</button>
  );
}
