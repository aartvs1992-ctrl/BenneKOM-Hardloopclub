'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import { Loading, ErrorNote, useReady } from '@/components/ui';
import { MON } from '@/lib/content';
import { CLUB } from '@/lib/club';

const date = (iso) => { const d = new Date(iso + 'T12:00:00'); return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`; };

export default function Nieuws() {
  const { data } = useApp();
  const [open, setOpen] = useState(null);
  if (!useReady()) return <Loading />;

  return (
    <>
      <h1>Nieuws</h1>
      <ErrorNote />
      <section className="section">
        <h2>Van de club</h2>
        <div className="list">
          {data.news.map((n) => (
            <button key={n.id} className="row" style={{ gridTemplateColumns: '1fr auto' }} onClick={() => setOpen(open === n.id ? null : n.id)}>
              <span style={{ minWidth: 0 }}>
                <span className="eyebrow">{n.author} · {date(n.published_at)}</span><br />
                <span className="t">{n.title}</span><br />
                <span className="s" style={open === n.id ? { whiteSpace: 'pre-line', color: 'var(--ink)' } : undefined}>
                  {open === n.id ? n.body : n.body.slice(0, 110) + (n.body.length > 110 ? '…' : '')}
                </span>
                {open === n.id && n.event_id ? <><br /><Link className="link" href={'/event/' + n.event_id}>Naar het evenement ›</Link></> : null}
              </span>
              <span className="chev">{open === n.id ? '−' : '+'}</span>
            </button>
          ))}
        </div>
      </section>

      <a className="panel" href={CLUB.strava} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
        <span className="eyebrow">Strava</span>
        <b>Bekijk de loopjes van de club op Strava ↗</b>
        <span className="small muted">Liever een foto delen met de club? Dat kan op de fotowall.</span>
      </a>
    </>
  );
}
