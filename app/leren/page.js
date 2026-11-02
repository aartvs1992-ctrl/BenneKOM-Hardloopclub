'use client';
import { useState } from 'react';
import { useApp } from '@/components/AppProvider';
import { Loading } from '@/components/ui';
import { MODULES } from '@/lib/content';

export default function Leren() {
  const { local, updateLocal } = useApp();
  const [open, setOpen] = useState(null);
  if (!local) return <Loading />;

  const done = local.done;
  const minutes = MODULES.filter((m, i) => done.includes(i)).reduce((a, m) => a + m[2], 0);
  const tip = MODULES[Math.floor(Date.now() / 864e5) % MODULES.length];
  const toggle = (i) => updateLocal({ done: done.includes(i) ? done.filter((x) => x !== i) : [...done, i] });

  if (open !== null) {
    const m = MODULES[open];
    return (
      <>
        <span className="eyebrow">{m[1]} · {m[2]} min</span>
        <h1>{m[0]}</h1>
        <div className="article panel"><p><b>{m[3]}</b></p><p>{m[4]}</p></div>
        <div className="btn-row">
          <button className={'btn ' + (done.includes(open) ? 'btn-done' : 'btn-gold')} onClick={() => toggle(open)}>{done.includes(open) ? '✓ Gelezen' : 'Markeer als gelezen'}</button>
          <button className="btn btn-line" onClick={() => setOpen(null)}>Alle modules</button>
        </div>
      </>
    );
  }

  return (
    <>
      <h1>Leren</h1>
      <div className="panel">
        <div className="section-head"><b>{done.length} van {MODULES.length} gelezen</b><span className="num small muted">{minutes} min</span></div>
        <div className="progress"><span style={{ width: (done.length / MODULES.length) * 100 + '%' }} /></div>
      </div>
      <div className="panel" style={{ background: 'var(--navy)', color: 'var(--on-navy)', border: 0 }}>
        <span className="eyebrow" style={{ color: 'var(--gold)' }}>Tip van vandaag</span>
        <h3>{tip[0]}</h3><p style={{ opacity: 0.85 }}>{tip[3]}</p>
      </div>
      <div className="list">
        {MODULES.map((m, i) => (
          <button key={i} className="row" style={{ gridTemplateColumns: 'auto 1fr auto' }} onClick={() => { setOpen(i); window.scrollTo(0, 0); }}>
            <span className={'check' + (done.includes(i) ? ' on' : '')}>{done.includes(i) ? '✓' : ''}</span>
            <span style={{ minWidth: 0 }}><span className="t">{m[0]}</span><br /><span className="s">{m[1]} · {m[2]} min · {m[3]}</span></span>
            <span className="chev">›</span>
          </button>
        ))}
      </div>
    </>
  );
}
