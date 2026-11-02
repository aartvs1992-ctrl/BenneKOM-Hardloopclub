'use client';
import { useState } from 'react';
import { DISTS, fmt, parseT, fuelPlan } from '@/lib/content';

export default function Voeding() {
  const [f, setF] = useState({ dist: 21.0975, time: '1:50:00', weight: 72, weather: 1, gut: 1 });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'number' || k !== 'time' ? +e.target.value : e.target.value });
  const s = parseT(f.time);
  const plan = Number.isNaN(s) ? null : fuelPlan({ seconds: s, weight: f.weight, weather: f.weather, gut: f.gut });

  return (
    <>
      <h1>Raceplan voeding</h1>
      <p className="muted">Vijf vragen, één plan voor koolhydraten, gels en water. Gebaseerd op de richtlijnen van ISSN en ACSM.</p>
      <div className="panel">
        <div className="grid2">
          <div className="field"><label htmlFor="v-d">1 · Afstand</label>
            <select className="input" id="v-d" value={f.dist} onChange={set('dist')}>{DISTS.map(([l, d]) => <option key={l} value={d}>{l}</option>)}</select></div>
          <div className="field"><label htmlFor="v-t">2 · Doeltijd</label><input className="input num" id="v-t" value={f.time} onChange={set('time')} /></div>
          <div className="field"><label htmlFor="v-w">3 · Gewicht (kg)</label><input className="input num" id="v-w" type="number" value={f.weight} onChange={set('weight')} /></div>
          <div className="field"><label htmlFor="v-weer">4 · Weer</label>
            <select className="input" id="v-weer" value={f.weather} onChange={set('weather')}><option value="0">Koel (onder 12°)</option><option value="1">Gemiddeld</option><option value="2">Warm (boven 20°)</option></select></div>
        </div>
        <div className="field"><label htmlFor="v-gut">5 · Ben je gewend aan eten tijdens het lopen?</label>
          <select className="input" id="v-gut" value={f.gut} onChange={set('gut')}><option value="0">Nee, nooit geprobeerd</option><option value="1">Een beetje</option><option value="2">Ja, goed getraind</option></select></div>
      </div>

      <div className="panel">
        {!plan ? <p>Vul een doeltijd in als 1:50:00.</p> : plan.none ? (
          <><h3>Onderweg niets nodig</h3><p>Onder de 75 minuten heb je genoeg aan je eigen voorraad. Drink water voor en na, en eet 2 à 3 uur vooraf een koolhydraatrijke maaltijd.</p></>
        ) : (
          <>
            <div className="readout">
              <div><span className="lbl">Koolhydraten</span><span className="big">{plan.cho} g</span><span className="lbl">per uur</span></div>
              <div><span className="lbl">Gels (25 g)</span><span className="big">{plan.gels}</span><span className="lbl">totaal</span></div>
              <div><span className="lbl">Water</span><span className="big">{plan.water}</span><span className="lbl">ml per uur</span></div>
            </div>
            <h3>Jouw schema</h3>
            <table><tbody>
              <tr><td>Start</td><td>Niets, je voorraad is vol</td></tr>
              {plan.moments.map((m, i) => <tr key={i}><td className="num">{fmt(m)}</td><td>Gel {i + 1} met een paar slokken water</td></tr>)}
            </tbody></table>
            <p className="small muted">Natrium: ongeveer {plan.sodium} mg per uur, vooral bij warm weer of als je zout zweet.</p>
          </>
        )}
      </div>
      <p className="note">Test je plan altijd eerst in een lange training, nooit voor het eerst op de wedstrijddag.</p>
    </>
  );
}
