'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import { Loading, ErrorNote, useReady, PhotoHeader } from '@/components/ui';
import ChallengeTabs from '@/components/ChallengeTabs';
import { fmt, MON } from '@/lib/content';
import { cooperPaces, COOPER_INFO } from '@/lib/cooper';

const dateLabel = (iso) => { const d = new Date(iso + 'T12:00:00'); return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`; };
const short = (iso) => { const d = new Date(iso + 'T12:00:00'); return `${d.getDate()} ${MON[d.getMonth()]}`; };
const m = (n) => n.toLocaleString('nl-NL') + ' m';
const signedM = (n) => (n > 0 ? '+' : n < 0 ? '−' : '±') + Math.abs(n) + ' m';
const range = ([a, b]) => `${fmt(a)}–${fmt(b)}`;
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Amsterdam' });

export default function Cooper() {
  const { data, local, act } = useApp();
  const [meters, setMeters] = useState('');
  const [day, setDay] = useState(today);
  const [formOpen, setFormOpen] = useState(false);
  const ready = useReady();
  if (!ready) return <Loading />;

  const notSetUp = data.cooper === null;
  const tests = (data.cooper || []).map((t, i, arr) => ({ ...t, delta: i ? t.meters - arr[i - 1].meters : null }));
  const last = tests[tests.length - 1];
  const best = tests.length ? Math.max(...tests.map((t) => t.meters)) : null;
  const bestTest = tests.find((t) => t.meters === best);
  // Je tempo's komen uit je laatste test: dat is je huidige niveau
  const P = last ? cooperPaces(last.meters) : null;

  async function add(ev) {
    ev.preventDefault();
    if (!local.name && !data.me) { location.href = '/profiel?terug=1'; return; }
    const n = parseInt(String(meters).replace(/\D/g, ''), 10);
    if (!n) return;
    const msg = best && n > best ? `Nieuw PR: ${m(n)}!` : 'Test opgeslagen. Je tempo\'s zijn bijgewerkt.';
    if (await act('addCooper', { meters: n, date: day }, msg)) { setMeters(''); setFormOpen(false); }
  }

  return (
    <>
      <PhotoHeader src="/club/groep-met-tempo.jpg" title="Coopertest" sub="Twaalf minuten zo ver mogelijk. Je afstand bepaalt je tempo's voor de intervallen." pos="center 35%" />
      <ChallengeTabs active="cooper" />
      <ErrorNote />

      <div className="panel callout">
        <b>{COOPER_INFO.title}</b>
        <p>{COOPER_INFO.text}</p>
      </div>

      {notSetUp ? (
        <section className="panel"><h3>Bijna klaar</h3><p className="muted">De coopertest wordt nog ingesteld. Probeer het later nog eens.</p></section>
      ) : last ? (
        <section className="panel">
          <div className="section-head"><h3>Jouw stand</h3><span className="small muted">{tests.length} {tests.length === 1 ? 'test' : 'tests'}</span></div>
          <div className="pr-big">
            <span className="lbl">Persoonlijk record</span>
            <span className="num">{m(best)}</span>
            <span className="small muted">{fmt((720 * 1000) / best)} per km · VDOT {cooperPaces(best).vdot.toFixed(1)} · {dateLabel(bestTest.date)}</span>
          </div>
          <div className="readout">
            <div><span className="lbl">Laatste test</span><span className="big">{last.meters}</span><span className="lbl">{dateLabel(last.date)}</span></div>
            <div><span className="lbl">T.o.v. vorige</span>
              <span className={'big ' + (last.delta == null ? '' : last.delta > 0 ? 'faster' : last.delta < 0 ? 'slower' : '')}>{last.delta == null ? '–' : signedM(last.delta)}</span>
              <span className="lbl">{last.delta == null ? 'eerste test' : last.delta > 0 ? 'verder' : last.delta < 0 ? 'minder ver' : 'gelijk'}</span></div>
            <div><span className="lbl">Niveau</span><span className="big">{P.vdot.toFixed(1)}</span><span className="lbl">VDOT</span></div>
          </div>
          {tests.length > 1 && <>
            <div className="section-head"><b>Je progressie</b><span className="small muted legend"><i className="lg-pr" /> PR</span></div>
            <Chart tests={tests.slice(-10)} best={best} />
          </>}
          <p className="note">{message(tests, best)}</p>
        </section>
      ) : (
        <section className="panel">
          <h3>Nog geen test</h3>
          <p className="muted">Vul na de coopertest je afstand in. Je krijgt dan meteen je niveau en je tempo&apos;s voor de intervallen.</p>
        </section>
      )}

      {P && (
        <section className="section" id="tempos">
          <h2>Jouw tempo&apos;s</h2>
          <div className="panel">
            <div className="pr-big">
              <span className="lbl">Drempeltempo · Bakken</span>
              <span className="num">{fmt(P.bakken)}<small style={{ fontSize: 20 }}>/km</small></span>
              <span className="small muted">Uit je test van {dateLabel(last.date)} ({m(last.meters)})</span>
            </div>
            <table>
              <thead><tr><th>Herhaling</th><th className="r">Tempo per km</th></tr></thead>
              <tbody>
                {P.reps.map((r) => (
                  <tr key={r.id}><td>{r.name}<br /><span className="small muted">{r.how}</span></td><td className="r num">{range(r.range)}</td></tr>
                ))}
                <tr><td>Rustig / duurloop<br /><span className="small muted">Hele zinnen praten</span></td><td className="r num">{range(P.easy)}</td></tr>
              </tbody>
            </table>
            <p className="note">Kortere herhalingen loop je iets sneller, lange blokken rustiger, en altijd onder de drempel. Na afloop moet je het gevoel hebben dat er nog een of twee herhalingen in hadden gezeten. Bij wind, warmte of een zware week loop je op gevoel.</p>
            <p className="small muted" style={{ margin: 0 }}>Zo rekenen we: je afstand geeft je VDOT (Jack Daniels). Daniels&apos; drempeltempo is dan {fmt(P.danielsT)}/km. Wij trainen volgens Marius Bakken en lopen 2% rustiger: {fmt(P.bakken)}/km. Je VO2max-tempo, voor af en toe, is {range(P.vo2max)}/km.</p>
            <Link className="link" href="/tools#threshold">Meer over drempeltraining en hoe het hoort te voelen ›</Link>
          </div>
        </section>
      )}

      {!notSetUp && (
        <section className="panel">
          {!formOpen ? (
            <button className="link" style={{ alignSelf: 'flex-start' }} onClick={() => setFormOpen(true)}>+ Coopertest invullen</button>
          ) : (
            <form className="section" onSubmit={add}>
              <h3>Coopertest invullen</h3>
              <div className="grid2">
                <div className="field"><label htmlFor="ct-m">Afstand in 12 min (meter)</label><input className="input num" id="ct-m" value={meters} onChange={(e) => setMeters(e.target.value)} placeholder="2800" inputMode="numeric" pattern="\d{4}" required /></div>
                <div className="field"><label htmlFor="ct-d">Datum</label><input className="input" id="ct-d" type="date" value={day} max={today()} onChange={(e) => setDay(e.target.value)} required /></div>
              </div>
              {/^\d{4}$/.test(meters) && +meters >= 1000 && +meters <= 5500 && (
                <p className="small muted" style={{ margin: 0 }}>Dat is VDOT {cooperPaces(+meters).vdot.toFixed(1)} en een drempeltempo van {fmt(cooperPaces(+meters).bakken)}/km.</p>
              )}
              <div className="btn-row"><button className="btn btn-gold" type="submit">Opslaan</button><button className="btn btn-line" type="button" onClick={() => setFormOpen(false)}>Annuleren</button></div>
            </form>
          )}
        </section>
      )}

      {tests.length > 0 && (
        <section className="section">
          <h2>Al je tests</h2>
          <div className="list">
            {[...tests].reverse().map((t) => (
              <div key={t.id} className="row" style={{ gridTemplateColumns: '1fr auto', cursor: 'default' }}>
                <span style={{ minWidth: 0 }}>
                  <span className="t num">{m(t.meters)}{t.meters === best && <span className="tag special" style={{ marginLeft: 8 }}>PR</span>}</span><br />
                  <span className="s">{dateLabel(t.date)} · VDOT {cooperPaces(t.meters).vdot.toFixed(1)} · drempel {fmt(cooperPaces(t.meters).bakken)}/km</span>
                </span>
                <span style={{ textAlign: 'right' }}>
                  {t.delta != null && <span className={'num small ' + (t.delta > 0 ? 'faster' : t.delta < 0 ? 'slower' : '')}>{signedM(t.delta)}</span>}
                  <br /><button className="link small" onClick={() => act('deleteCooper', { id: t.id }, 'Test verwijderd')}>Verwijder</button>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function message(tests, best) {
  const last = tests[tests.length - 1];
  if (tests.length === 1) return 'Je eerste test staat. Over 6 tot 8 weken weer testen: dan zie je of je tempo\'s omhoog kunnen.';
  if (last.meters === best && last.delta > 0) return `Nieuw PR! ${last.delta} meter verder dan de vorige keer. Je tempo's zijn meteen bijgewerkt.`;
  if (last.delta > 0) return `Verder dan de vorige keer. Nog ${best - last.meters} meter tot je PR.`;
  const first = tests[0].meters;
  if (best > first) return `Sinds je eerste test ben je ${best - first} meter verder gekomen.`;
  return 'Elke test telt. Je tempo\'s komen altijd uit je laatste test, zodat ze passen bij hoe je nu loopt.';
}

// Lijngrafiek van je tests; verder = hoger, gestippelde lijn = je PR
function Chart({ tests, best }) {
  const W = 340, H = 170, L = 46, R = 12, T = 18, B = 26;
  const vals = tests.map((t) => t.meters);
  const mn = Math.min(...vals), mx = Math.max(best, ...vals);
  const pad = Math.max(40, (mx - mn) * 0.12);
  const lo = mn - pad, hi = mx + pad;
  const x = (i) => L + (i * (W - L - R)) / (tests.length - 1);
  const y = (v) => H - B - ((v - lo) / (hi - lo)) * (H - T - B);
  const pts = tests.map((t, i) => `${x(i)},${y(t.meters)}`).join(' ');
  const lastT = tests[tests.length - 1];
  return (
    <div className="chart" role="img" aria-label={`Grafiek van je laatste ${tests.length} coopertests; PR ${best} meter`}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
        {[mn].filter((v) => v !== best).map((v) => (
          <g key={v}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="grid" /><text x={L - 6} y={y(v) + 4} textAnchor="end" className="axis">{v}</text></g>
        ))}
        <line x1={L} x2={W - R} y1={y(best)} y2={y(best)} className="prline" />
        <text x={L - 6} y={y(best) + 4} textAnchor="end" className="axis pr-label">{best}</text>
        <polygon points={`${x(0)},${H - B} ${pts} ${x(tests.length - 1)},${H - B}`} className="area" />
        <polyline points={pts} className="line" />
        {tests.map((t, i) => (
          <circle key={t.id} cx={x(i)} cy={y(t.meters)} r={t.meters === best ? 6 : 4} className={t.meters === best ? 'pr' : 'dot'}><title>{`${short(t.date)}: ${t.meters} m`}</title></circle>
        ))}
        <text x={x(tests.length - 1)} y={y(lastT.meters) - 10} textAnchor="end" className="axis last-label">{lastT.meters} m</text>
        <text x={L} y={H - 7} className="axis">{short(tests[0].date)}</text>
        <text x={W - R} y={H - 7} textAnchor="end" className="axis">{short(lastT.date)}</text>
      </svg>
    </div>
  );
}
