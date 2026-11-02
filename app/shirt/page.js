'use client';
import Link from 'next/link';
import { SHIRTS, euro } from '@/lib/content';

export default function Shirt() {
  return (
    <>
      <h1>Clubshirt</h1>
      <p className="muted">Navy met goud, gemaakt door Bioracer. Passen kan bij De Bosrand; levering duurt ongeveer twee maanden.</p>
      <div className="panel setrow" style={{ flexDirection: 'row' }}>
        <span><b>Bestelronde gesloten</b><br /><span className="small muted">Zet de melding aan, dan hoor je het als hij opengaat</span></span>
        <Link className="btn btn-gold btn-sm" href="/meldingen">Melding</Link>
      </div>
      <div className="list">
        {SHIRTS.map(([n, p, s]) => (
          <div key={n} className="row" style={{ gridTemplateColumns: '1fr auto', cursor: 'default' }}>
            <span style={{ minWidth: 0 }}><span className="t">{n}</span>{s && <><br /><span className="s">{s}</span></>}</span>
            <span className="num" style={{ fontWeight: 700 }}>{euro(p)}</span>
          </div>
        ))}
      </div>
    </>
  );
}
