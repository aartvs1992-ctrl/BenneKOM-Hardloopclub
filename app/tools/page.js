'use client';
import { useState } from 'react';
import Link from 'next/link';
import { PhotoHeader } from '@/components/ui';
import { DISTS, fmt, parseT, riegel, ZONES, splits } from '@/lib/content';

const TABS = [['training', 'Trainingstempo'], ['tempo', 'Tempo'], ['voorspeller', 'Voorspeller'], ['zones', 'Zones'], ['splits', 'Splits']];

export default function Tools() {
  const [tab, setTab] = useState('training');
  return (
    <>
      <PhotoHeader src="/club/beukenlaan.jpg" title="Calculator" sub="Je trainingstempo's, voorspeller, hartslagzones en splits." pos="center 45%" />
      <div className="seg" role="group" aria-label="Calculator">
        {TABS.map(([k, l]) => <button key={k} aria-pressed={tab === k} onClick={() => setTab(k)}>{l}</button>)}
      </div>
      <div className="panel">
        {tab === 'training' && <Training />}
        {tab === 'tempo' && <Tempo />}
        {tab === 'voorspeller' && <Predictor />}
        {tab === 'zones' && <Zones />}
        {tab === 'splits' && <Splits />}
      </div>
    </>
  );
}

// Tempo dat je een bepaalde tijd (minuten) zou volhouden, afgeleid van een wedstrijdtijd (Riegel 1,06)
function paceFor(sec, km, minutes) {
  const T = minutes * 60;
  const d = km * Math.pow(T / sec, 1 / 1.06);
  return T / d;
}

// Conservatief, in de geest van de Noorse aanpak van Marius Bakken: threshold gecontroleerd en eerder te rustig dan te snel.
// Elke band: [snelste, rustigste] als 'tempo dat je zoveel minuten zou volhouden', plus een vaste opslag voor rustig.
const BANDS = [
  { id: 'rustig', name: 'Rustig / duurloop', how: 'Hele zinnen praten', calc: (s, d) => [paceFor(s, d, 60) + 50, paceFor(s, d, 60) + 90] },
  { id: 'threshold', name: 'Threshold', how: 'Korte intervallen, 1–3 min', calc: (s, d) => { const t = paceFor(s, d, 65) + 1; return [t, t + 6]; } },
  { id: 'subthreshold', name: 'Sub-threshold', how: 'Langere blokken, 5–10 min', calc: (s, d) => { const t = paceFor(s, d, 65) + 1; return [t + 6, t + 13]; } },
  { id: 'vo2max', name: 'VO2max', how: '2–5 min, af en toe', calc: (s, d) => [paceFor(s, d, 12), paceFor(s, d, 18)] },
  { id: 'strides', name: 'Strides', how: '15–20 sec, soepel', calc: (s, d) => [paceFor(s, d, 4), paceFor(s, d, 6)] },
];

function Training() {
  const [d, setD] = useState(10);
  const [t, setT] = useState('45:00');
  const s = parseT(t);
  const ok = !Number.isNaN(s) && s > 0;
  return (
    <>
      <p className="small" style={{ margin: 0 }}>Vul een recente wedstrijd- of testtijd in. Je krijgt dan je tempo per soort training.</p>
      <div className="callout" style={{ paddingLeft: 12 }}>
        <b>Dit is een richtlijn, geen opdracht</b>
        <p className="small" style={{ margin: '4px 0 0' }}>Je tempo hangt sterk af van de dag en hoe je je voelt: slaap, drukte, weer en vermoeidheid tellen allemaal mee. Luister naar je lichaam. Bij threshold moet het comfortabel zwaar voelen; is dat niet zo, loop dan gewoon wat rustiger.</p>
      </div>
      <div className="grid2">
        <div className="field"><label htmlFor="tr-d">Afstand</label>
          <select className="input" id="tr-d" value={d} onChange={(e) => setD(+e.target.value)}>{DISTS.map(([l, x]) => <option key={l} value={x}>{l}</option>)}</select></div>
        <div className="field"><label htmlFor="tr-t">Tijd</label><input className="input num" id="tr-t" value={t} onChange={(e) => setT(e.target.value)} placeholder="mm:ss of u:mm:ss" /></div>
      </div>
      <table>
        <thead><tr><th>Training</th><th className="r">Tempo per km</th></tr></thead>
        <tbody>{ok ? BANDS.map((b) => { const [a, z] = b.calc(s, d); return (
          <tr key={b.name}><td><Link className="link" href={'/tempo#' + b.id}>{b.name}</Link><br /><span className="small muted">{b.how}</span></td><td className="r num">{fmt(a)}–{fmt(z)}</td></tr>
        ); }) : <tr><td colSpan="2">Vul een tijd in als 45:00 of 1:39:00.</td></tr>}</tbody>
      </table>
      <p className="note">We rekenen bewust conservatief, in de lijn van Marius Bakken en de Noorse aanpak: threshold voor de korte intervallen, sub-threshold (5 tot 10 seconden per km rustiger) voor de langere blokken. Zo kun je het vaker per week doen. De ranges zijn ruim omdat elke dag anders is. Dat is iets rustiger dan de tabellen van Jack Daniels. Voelt het zwaarder dan &quot;comfortabel zwaar&quot;? Dan loop je de rustige kant van de band, of nog iets langzamer. Bij warm weer, wind of heuvels loop je op gevoel.</p>
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
