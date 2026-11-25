'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from './AppProvider';
import { EventRow } from './ui';
import { fmt, daysTo, MON, DAY } from '@/lib/content';
import {
  MARATHON, KEY_SESSIONS,
  mpPace, sessionStats, sessionSteps, easyFactor, jogFactor, GOAL_MIN, GOAL_MAX,
} from '@/lib/marathon';

const KEY = 'bk-marathon-goal';
const T0 = new Date('2027-01-10T12:00:00'), T1 = new Date('2027-04-14T12:00:00');
const at = (iso) => (((new Date(iso + 'T12:00:00') - T0) / (T1 - T0)) * 100).toFixed(2) + '%';
const short = (iso) => { const d = new Date(iso + 'T12:00:00'); return `${DAY[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`; };
const hm = (min) => Math.floor(min / 60) + 'u' + String(Math.round(min % 60)).padStart(2, '0');
const goalLabel = (min) => Math.floor(min / 60) + ':' + String(min % 60).padStart(2, '0');
const kmLabel = (k, d = 0) => k.toFixed(d).replace('.', ',');
const BAR_SCALE = 170; // minuten: de zwaarste sessie vult bijna de hele breedte

export default function MarathonPlan() {
  const { data } = useApp();
  // Doel: eerder gekozen, anders 3:00
  const [goal, setGoal] = useState(180);
  const [variant, setVariant] = useState('base');
  const [s3, setS3] = useState('base');
  useEffect(() => {
    try { const g = +localStorage.getItem(KEY); if (g >= GOAL_MIN && g <= GOAL_MAX) setGoal(g); } catch {}
  }, []);
  const pick = (g) => { setGoal(g); try { localStorage.setItem(KEY, String(g)); } catch {} };

  const mp = mpPace(goal);
  const days = daysTo(MARATHON.date);
  const race = data.events.find((e) => e.id === MARATHON.id);
  const marks = [
    ...KEY_SESSIONS.map((s) => ({ k: 'ses', d: s.date, l: 'Sessie ' + s.n, s: short(s.date) })),
    { k: 'race end', d: MARATHON.date, l: 'Rotterdam', s: short(MARATHON.date) },
  ];

  return (
    <>
      <section className="hero mr-hero">
        <span className="eyebrow">Op weg naar Rotterdam</span>
        <h1>3 key sessions</h1>
        <p className="mr-lead">Eén lange zondag in de vier weken, met blokken op marathontempo. Alles gaat op tijd: iedereen start tegelijk, dribbelt tegelijk en komt elkaar op de ronde tegen. Niemand is langer dan 2u40 onderweg.</p>
        <div className="mr-tl" aria-label="Tijdlijn tot de marathon">
          <div className="mr-axis" />
          {[['2027-02-01', 'feb'], ['2027-03-01', 'mrt'], ['2027-04-01', 'apr']].map(([d, l]) => <span key={d} className="mr-mon" style={{ left: at(d) }}>{l}</span>)}
          {marks.map((m, i) => (
            <div key={i} className={'mr-mk ' + m.k} style={{ left: at(m.d) }}>
              <span className="dot" />
              {m.l && <span className="lb">{m.l}<small>{m.s}</small></span>}
            </div>
          ))}
        </div>
        <div className="mr-key"><span>Key session</span><span className="k2">Marathon</span></div>
        {days > 0 && <p className="mr-count"><b>{days}</b> dagen tot de start in Rotterdam</p>}
      </section>

      {race && <div className="list"><EventRow e={race} /></div>}

      <section className="panel mr-goal">
        <div className="section-head"><h3>Jouw marathondoel</h3><b className="mr-goalv num">{goalLabel(goal)}</b></div>
        <input type="range" id="mr-goal" min={GOAL_MIN} max={GOAL_MAX} step="1" value={goal} onChange={(e) => pick(+e.target.value)} aria-label="Marathondoel in minuten" />
        <div className="readout">
          <div><span className="big">{fmt(mp)}</span><span className="lbl">marathontempo /km</span></div>
          <div><span className="big">{fmt(mp * easyFactor(goal))}</span><span className="lbl">in- en uitlopen /km</span></div>
          <div><span className="big">{fmt(mp * jogFactor(goal))}</span><span className="lbl">dribbel /km</span></div>
        </div>
        <p className="small muted">Schuif naar je marathondoel. De app onthoudt je keuze.</p>
        <div className="seg" role="group" aria-label="Variant">
          <button aria-pressed={variant === 'base'} onClick={() => setVariant('base')}>Basis</button>
          <button aria-pressed={variant === 'short'} onClick={() => setVariant('short')}>Kort</button>
        </div>
        <p className="small muted">Kort is voor wie minder kilometers maakt of 4 uur of langzamer loopt: één blok minder, dezelfde start en ronde.</p>
      </section>

      {KEY_SESSIONS.map((s) => {
        const v = s.n === 3 && s3 === 'long' ? s.long : s[variant];
        const st = sessionStats(v.blocks, goal);
        const ev = data.events.find((e) => e.id === s.id);
        const going = Boolean(data.mine?.[s.id]);
        const n = data.counts?.[s.id] || 0;
        return (
          <section key={s.id} className="panel mr-ses">
            <div>
              <span className="eyebrow">{short(s.date)} · {s.weeks} weken voor de marathon</span>
              <h2>Sessie {s.n}</h2>
            </div>
            <p>{s.intro}</p>
            {s.n === 3 && (
              <div className="seg" role="group" aria-label="Vorm van sessie 3">
                <button aria-pressed={s3 === 'base'} onClick={() => setS3('base')}>{variant === 'short' ? '3 × 30 min' : '3 × 35 min'}</button>
                <button aria-pressed={s3 === 'long'} onClick={() => setS3('long')}>Doorloper</button>
              </div>
            )}
            <p className="mr-what">{v.text}</p>
            <div className="readout">
              <div><span className="big">{hm(st.min)}</span><span className="lbl">totale tijd</span></div>
              <div><span className="big">≈{kmLabel(st.km)} km</span><span className="lbl">bij {goalLabel(goal)}</span></div>
              <div><span className="big">{kmLabel(st.mpKm, 1)} km</span><span className="lbl">op MP ({st.mpMin} min)</span></div>
            </div>
            <div style={{ width: Math.min(100, (st.min / BAR_SCALE) * 100) + '%' }}>
              <div className="mr-bar" aria-hidden="true">
                {v.blocks.map(([t, m], i) => <i key={i} className={'b-' + t} style={{ flexGrow: m }}>{m >= 10 ? m + '\'' : ''}</i>)}
              </div>
            </div>
            <ul className="mr-steps">{sessionSteps(v.blocks).map(([a, b]) => <li key={a}><span>{a}</span><span>{b}</span></li>)}</ul>
            {ev && (
              <Link className={'btn ' + (going ? 'btn-done' : 'btn-gold')} href={'/event/' + s.id}>
                {going ? '✓ Je bent erbij' : 'Ik ben erbij'}{n > 0 ? ` · ${n} ${n === 1 ? 'loper' : 'lopers'}` : ''}
              </Link>
            )}
          </section>
        );
      })}

      <section className="section">
        <h2>Zo haal je er het meest uit</h2>
        <div className="tiles mr-tips">
          <div className="tile"><span className="k">Tempo kiezen</span><span className="v">Kies het tempo dat je echt denkt te kunnen lopen. Twijfel je, kies dan het langzaamste doel dat realistisch voelt.</span></div>
          <div className="tile"><span className="k">Drinkpost</span><span className="v">Ronde van 2,5 tot 4 km met één tafel. Oefen elke sessie je gels en drinken op racetempo.</span></div>
          <div className="tile"><span className="k">Generale repetitie</span><span className="v">Sessie 3 met je racedag-ontbijt, wedstrijdschoenen en wedstrijdkleding.</span></div>
          <div className="tile"><span className="k">Herstel</span><span className="v">Houd de dag erna rustig en plan in die week geen tweede zware training.</span></div>
        </div>
      </section>
      <p className="small muted">Kilometers zijn schattingen: in- en uitlopen gaat iets langzamer dan je marathontempo, dribbelen nog wat rustiger. Starttijd en ronde volgen.</p>
    </>
  );
}
