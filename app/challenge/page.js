'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import { Loading, ErrorNote, useReady, PhotoHeader } from '@/components/ui';
import { dparts, rel, fmt, parseT, MON } from '@/lib/content';

// Laatste drie maanden als keuze voor de editie
function editions() {
  const d = new Date();
  return [0, 1, 2].map((i) => { const x = new Date(d.getFullYear(), d.getMonth() - i, 1); return `${MON[x.getMonth()]} ${x.getFullYear()}`; });
}

export default function Challenge() {
  const { data, local, act } = useApp();
  const eds = editions();
  const [t, setT] = useState('');
  const [ed, setEd] = useState(eds[1]);
  if (!useReady()) return <Loading />;

  const best = {};
  for (const r of data.results) if (!best[r.name] || r.seconds < best[r.name].seconds) best[r.name] = r;
  const board = Object.values(best).sort((a, b) => a.seconds - b.seconds);
  const mine = data.results.filter((r) => r.mine);
  const next = data.events.find((e) => e.type === 'challenge');
  const meIn = board.findIndex((r) => r.mine);

  return (
    <>
      <PhotoHeader src="/club/juichen.jpg" title="5km Challenge" sub="Elke laatste zaterdag van de maand, 10:00. Loop je tijd, zie je PR en de ranglijst." pos="center 15%" />
      <ErrorNote />
      {next && (
        <Link className="panel" href={'/event/' + next.id} style={{ textDecoration: 'none', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <span><span className="eyebrow">Volgende editie · {rel(next.date)}</span><br /><b style={{ fontSize: 18 }}>{dparts(next.date).w} {dparts(next.date).d} {dparts(next.date).m} · {next.time || '10:00'}</b></span>
          <span className="btn btn-gold btn-sm">{data.mine[next.id] ? '✓ Ingeschreven' : 'Inschrijven'}</span>
        </Link>
      )}

      <form className="panel" onSubmit={async (ev) => {
        ev.preventDefault();
        if (!local.name) { location.href = '/meer?naam=1'; return; }
        const s = parseT(t);
        if (Number.isNaN(s)) return;
        const prev = mine.length ? Math.min(...mine.map((r) => r.seconds)) : Infinity;
        if (await act('addResult', { seconds: s, edition: ed }, s < prev ? `Nieuw PR: ${fmt(s)} 🎉` : 'Tijd opgeslagen')) setT('');
      }}>
        <h3>Jouw PR</h3>
        {mine.length ? (
          <div className="readout">
            <div><span className="lbl">Snelste</span><span className="big">{fmt(mine[0].seconds)}</span></div>
            <div><span className="lbl">Tempo</span><span className="big">{fmt(mine[0].seconds / 5)}</span></div>
            <div><span className="lbl">Gelopen</span><span className="big">{mine.length}×</span></div>
          </div>
        ) : <p className="muted">Nog geen tijd ingevuld. Vul hieronder je tijd van de laatste editie in.</p>}
        <div className="grid2">
          <div className="field"><label htmlFor="ch-time">Tijd (mm:ss)</label><input className="input num" id="ch-time" value={t} onChange={(e) => setT(e.target.value)} placeholder="22:45" inputMode="numeric" pattern="\d{1,2}[:.]\d{2}" required /></div>
          <div className="field"><label htmlFor="ch-ed">Editie</label><select className="input" id="ch-ed" value={ed} onChange={(e) => setEd(e.target.value)}>{eds.map((x) => <option key={x}>{x}</option>)}</select></div>
        </div>
        <button className="btn btn-gold" type="submit">Tijd opslaan</button>
        {mine.length > 0 && (
          <details><summary className="link" style={{ cursor: 'pointer' }}>Mijn tijden ({mine.length})</summary>
            {mine.map((r) => <div key={r.id} className="setrow" style={{ padding: '8px 0' }}><span className="num">{r.edition} · {fmt(r.seconds)}</span><button className="link" type="button" onClick={() => act('deleteResult', { id: r.id }, 'Tijd verwijderd')}>Verwijderen</button></div>)}
          </details>
        )}
      </form>

      <section className="section">
        <div className="section-head"><h2>Ranglijst</h2>{meIn >= 0 && <span className="small muted">Jij staat {meIn + 1}e</span>}</div>
        {board.length ? (
          <div className="panel tablewrap" style={{ padding: '6px 10px' }}>
            <table>
              <thead><tr><th>#</th><th>Naam</th><th className="r">Beste</th><th className="r">Tempo</th></tr></thead>
              <tbody>{board.map((r, i) => <tr key={r.id} className={r.mine ? 'me' : ''}><td className="num">{i + 1}</td><td>{r.name}</td><td className="r num">{fmt(r.seconds)}</td><td className="r num">{fmt(r.seconds / 5)}</td></tr>)}</tbody>
            </table>
          </div>
        ) : <p className="panel muted">Nog geen tijden. Wees de eerste!</p>}
      </section>
    </>
  );
}
