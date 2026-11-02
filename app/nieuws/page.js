'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import { Loading, ErrorNote, useReady } from '@/components/ui';
import { fmt, MON } from '@/lib/content';
import { CLUB } from '@/lib/club';

const date = (iso) => { const d = new Date(iso + 'T12:00:00'); return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`; };

export default function Nieuws() {
  const { data } = useApp();
  const [strava, setStrava] = useState(null);
  const [open, setOpen] = useState(null);
  useEffect(() => { fetch('/api/strava').then((r) => r.json()).then(setStrava).catch(() => setStrava({ activities: [] })); }, []);
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

      <section className="section">
        <div className="section-head"><h2>Strava</h2><a className="link" href={CLUB.strava} target="_blank" rel="noopener noreferrer">Club op Strava ↗</a></div>
        {!strava ? <div className="skeleton" /> : strava.activities?.length ? (
          <div className="list">
            {strava.activities.slice(0, 15).map((a, i) => (
              <div key={i} className="row" style={{ gridTemplateColumns: '1fr auto', cursor: 'default' }}>
                <span style={{ minWidth: 0 }}><span className="t">{a.name}</span><br /><span className="s">{a.athlete}</span></span>
                <span className="num small" style={{ textAlign: 'right' }}>{String(a.km).replace('.', ',')} km<br /><span className="muted">{a.km ? fmt(a.seconds / a.km) + '/km' : ''}</span></span>
              </div>
            ))}
          </div>
        ) : <p className="panel muted">{strava.configured ? (strava.error || 'Nog geen recente loopjes.') : 'De Strava-feed verschijnt hier zodra de koppeling is ingesteld.'}</p>}
      </section>
    </>
  );
}
