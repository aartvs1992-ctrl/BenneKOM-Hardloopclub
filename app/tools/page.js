'use client';
import { useState } from 'react';
import Link from 'next/link';
import { DISTS, fmt, parseT, riegel, ZONES, splits } from '@/lib/content';

const TABS = [['tempo', 'Tempo'], ['voorspeller', 'Voorspeller'], ['zones', 'Zones'], ['splits', 'Splits']];

export default function Tools() {
  const [tab, setTab] = useState('tempo');
  return (
    <>
      <h1>Calculator</h1>
      <div className="seg" role="group" aria-label="Calculator">
        {TABS.map(([k, l]) => <button key={k} aria-pressed={tab === k} onClick={() => setTab(k)}>{l}</button>)}
      </div>
      <div className="panel">
        {tab === 'tempo' && <Tempo />}
        {tab === 'voorspeller' && <Predictor />}
        {tab === 'zones' && <Zones />}
        {tab === 'splits' && <Splits />}
      </div>
      <Link className="tile" href="/voeding"><span className="k">Voeding voor je race →</span><span className="v">Koolhydraten, gels en water op maat</span></Link>
    </>
  );
}

function Tempo() {
  const [pace, setPace] = useState(300);
  const nudge = (d) => setPace((p) => Math.min(480, Math.max(180, p + d)));
  return (
    <>
      <div className="field">
        <label htmlFor="tp">Looptempo per km</label>
        <input id="tp" type="range" min="180" max="480" step="1" value={pace} onChange={(e) => setPace(+e.target.value)} />
      </div>
      <div className="readout">
        <div><span className="lbl">Tempo</span><span className="big">{fmt(pace)}</span></div>
        <div><span className="lbl">Snelheid</span><span className="big">{(3600 / pace).toFixed(1)}</span><span className="lbl">km/u</span></div>
        <div><span className="lbl">Bijstellen</span><span style={{ display: 'flex', gap: 4 }}><button className="chip" onClick={() => nudge(-5)}>−5s</button><button className="chip" onClick={() => nudge(5)}>+5s</button></span></div>
      </div>
      <table><tbody>{[['1 km', 1], ...DISTS].map(([l, d]) => <tr key={l}><td>{l}</td><td className="r num">{fmt(d * pace)}</td></tr>)}</tbody></table>
    </>
  );
}

function Predictor() {
  const [d, setD] = useState(5);
  const [t, setT] = useState('24:30');
  const s = parseT(t);
  return (
    <>
      <div className="grid2">
        <div className="field"><label htmlFor="pr-d">Bekende afstand</label>
          <select className="input" id="pr-d" value={d} onChange={(e) => setD(+e.target.value)}>{DISTS.map(([l, x]) => <option key={l} value={x}>{l}</option>)}</select></div>
        <div className="field"><label htmlFor="pr-t">Tijd</label><input className="input num" id="pr-t" value={t} onChange={(e) => setT(e.target.value)} placeholder="mm:ss of u:mm:ss" /></div>
      </div>
      <table>
        <thead><tr><th>Afstand</th><th className="r">Voorspelling</th><th className="r">Tempo</th></tr></thead>
        <tbody>{Number.isNaN(s) ? <tr><td colSpan="3">Vul een tijd in als 24:30 of 1:52:00.</td></tr>
          : DISTS.map(([l, d2]) => { const t2 = riegel(s, d, d2); return <tr key={l}><td>{l}</td><td className="r num">{fmt(t2)}</td><td className="r num">{fmt(t2 / d2)}/km</td></tr>; })}</tbody>
      </table>
      <p className="note">Formule van Riegel (T₂ = T₁ × (D₂/D₁)^1,06). Werkt het best als je de langere afstand ook echt traint.</p>
    </>
  );
}

function Zones() {
  const [mx, setMx] = useState(190);
  const [rs, setRs] = useState(55);
  const res = mx - rs;
  return (
    <>
      <div className="grid2">
        <div className="field"><label htmlFor="z-max">Max. hartslag</label><input className="input num" id="z-max" type="number" value={mx} onChange={(e) => setMx(+e.target.value)} /></div>
        <div className="field"><label htmlFor="z-rest">Rusthartslag</label><input className="input num" id="z-rest" type="number" value={rs} onChange={(e) => setRs(+e.target.value)} /></div>
      </div>
      <table>
        <thead><tr><th>Zone</th><th>Gevoel</th><th className="r">Hartslag</th></tr></thead>
        <tbody>{mx > rs && rs > 0 ? ZONES.map((z) => <tr key={z[0]}><td><b>Zone {z[0]}</b></td><td className="small">{z[1]}</td><td className="r num">{Math.round(rs + res * z[2])}–{Math.round(rs + res * z[3])}</td></tr>)
          : <tr><td colSpan="3">Je max. hartslag moet hoger zijn dan je rusthartslag.</td></tr>}</tbody>
      </table>
      <p className="note">Karvonen-methode (hartslagreserve). Zone 2 is je basis: zo&apos;n 80% van je kilometers.</p>
    </>
  );
}

function Splits() {
  const [d, setD] = useState(10);
  const [t, setT] = useState('50:00');
  const [neg, setNeg] = useState(false);
  const s = parseT(t);
  return (
    <>
      <div className="grid2">
        <div className="field"><label htmlFor="sp-d">Afstand</label>
          <select className="input" id="sp-d" value={d} onChange={(e) => setD(+e.target.value)}>{DISTS.map(([l, x]) => <option key={l} value={x}>{l}</option>)}</select></div>
        <div className="field"><label htmlFor="sp-t">Doeltijd</label><input className="input num" id="sp-t" value={t} onChange={(e) => setT(e.target.value)} /></div>
      </div>
      <div className="seg" role="group" aria-label="Strategie">
        <button aria-pressed={!neg} onClick={() => setNeg(false)}>Gelijkmatig</button>
        <button aria-pressed={neg} onClick={() => setNeg(true)}>Negative split</button>
      </div>
      <div className="tablewrap">
        <table>
          <thead><tr><th>Km</th><th className="r">Split</th><th className="r">Totaal</th></tr></thead>
          <tbody>{Number.isNaN(s) ? <tr><td colSpan="3">Vul een doeltijd in.</td></tr>
            : splits(s, d, neg).map((r) => <tr key={r.km}><td className="num">{Number.isInteger(r.km) ? r.km : r.km.toFixed(2).replace('.', ',')}</td><td className="r num">{fmt(r.split)}</td><td className="r num">{fmt(r.cum)}</td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}
