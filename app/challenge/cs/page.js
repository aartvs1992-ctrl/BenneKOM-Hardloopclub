'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import { Loading, ErrorNote, useReady, PhotoHeader } from '@/components/ui';
import ChallengeTabs from '@/components/ChallengeTabs';
import { fmt, MON } from '@/lib/content';
import { csPaces, csCalc, CS_INFO, CS_ENABLED } from '@/lib/cs';

const dateLabel = (iso) => { const d = new Date(iso + 'T12:00:00'); return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`; };
const short = (iso) => { const d = new Date(iso + 'T12:00:00'); return `${d.getDate()} ${MON[d.getMonth()]}`; };
const m = (n) => Math.round(n).toLocaleString('nl-NL') + ' m';
const range = ([a, b]) => `${fmt(a)}–${fmt(b)}`;
const secs = (s) => { const r = Math.round(s); return (r > 0 ? '−' : r < 0 ? '+' : '±') + Math.abs(r) + ' s'; }; // positief = sneller
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Amsterdam' });
const valid = (d3, d12) => d3 >= 400 && d3 <= 1600 && d12 >= 1500 && d12 <= 5500 && csCalc(d3, d12).ok && d12 / 12 < d3 / 3;

export default function CsTest() {
  const { data, local, act } = useApp();
  const [d3, setD3] = useState('');
  const [d12, setD12] = useState('');
  const [day, setDay] = useState(today);
  const [formOpen, setFormOpen] = useState(false);
  const [demo, setDemo] = useState(false);
  useEffect(() => {
    const d = new URLSearchParams(location.search).get('demo') === '1';
    // Nog niet live: zonder ?demo=1 terug naar de coopertest
    if (!CS_ENABLED && !d) { location.replace('/challenge/cooper'); return; }
    setDemo(d);
  }, []);
  const ready = useReady();
  if (!ready || (!CS_ENABLED && !demo)) return <Loading />;

  // Voorbeeld (/challenge/cs?demo=1): Aarts CS-test, zonder iets op te slaan
  const notSetUp = !demo && data.cs === null;
  const rows = demo ? [{ id: 'demo', date: '2026-11-24', d3: 1080, d12: 3900 }] : (data.cs || []);
  const tests = rows.map((t) => ({ ...t, ...csCalc(t.d3, t.d12) })).filter((t) => t.ok)
    .map((t, i, arr) => ({ ...t, delta: i ? arr[i - 1].csPace - t.csPace : null })); // positief = sneller
  const last = tests[tests.length - 1];
  const bestPace = tests.length ? Math.min(...tests.map((t) => t.csPace)) : null;
  const bestTest = tests.find((t) => t.csPace === bestPace);
  const P = last ? csPaces(last.d3, last.d12) : null;
  const n3 = parseInt(d3, 10), n12 = parseInt(d12, 10);

  async function add(ev) {
    ev.preventDefault();
    if (!local.name && !data.me) { location.href = '/profiel?terug=1'; return; }
    if (!valid(n3, n12)) return;
    const c = csCalc(n3, n12);
    const msg = bestPace && c.csPace < bestPace ? `Nieuw PR: CS ${fmt(c.csPace)}/km!` : 'Test opgeslagen. Je tempo\'s zijn bijgewerkt.';
    if (await act('addCs', { d3: n3, d12: n12, date: day }, msg)) { setD3(''); setD12(''); setFormOpen(false); }
  }

  return (
    <>
      <PhotoHeader src="/club/samen-tempo.jpg" title="CS-test" sub="3 minuten en 12 minuten all-out: je Critical Speed, de grens tussen lang volhouden en opbranden." pos="center 40%" />
      <ChallengeTabs active="cs" />
      <ErrorNote />
      {demo && <p className="note">Voorbeeld: een CS-test met 1.080 m in 3 minuten en 3.900 m in 12 minuten. Er wordt niets opgeslagen.</p>}

      <div className="panel callout">
        <b>{CS_INFO.title}</b>
        <p>{CS_INFO.text}</p>
      </div>

      <section className="panel">
        <h3>Zo doe je de test</h3>
        <ol className="cs-steps">
          <li><b>Samen inlopen (± 20 min)</b><span>10 min inlopen, loopscholing en een paar versnellingen</span></li>
          <li><b>3 minuten all-out</b><span>Zo ver mogelijk. Noteer je afstand</span></li>
          <li><b>15–20 minuten pauze</b><span>Wandelen of rustig dribbelen</span></li>
          <li><b>12 minuten all-out</b><span>Zo ver mogelijk, gelijkmatig verdeeld. Noteer je afstand</span></li>
          <li><b>Samen uitlopen</b><span>Rustig, samen</span></li>
        </ol>
      </section>

      {notSetUp ? (
        <section className="panel"><h3>Bijna klaar</h3><p className="muted">De CS-test wordt nog ingesteld. Probeer het later nog eens.</p><Link className="link" href="/challenge/cs?demo=1">Bekijk een voorbeeld ›</Link></section>
      ) : last ? (
        <section className="panel">
          <div className="section-head"><h3>Jouw stand</h3><span className="small muted">{tests.length} {tests.length === 1 ? 'test' : 'tests'}</span></div>
          <div className="pr-big">
            <span className="lbl">Jouw Critical Speed</span>
            <span className="num">{fmt(last.csPace)}<small style={{ fontSize: 20 }}>/km</small></span>
            <span className="small">Dat is het tempo dat je zo&apos;n <b>30 tot 40 minuten</b> volhoudt.</span>
            <span className="small muted">{m(last.d3)} in 3 min + {m(last.d12)} in 12 min · {dateLabel(last.date)}</span>
          </div>
          {tests.length > 1 && <>
            <div className="section-head"><b>Je progressie</b><span className="small muted legend"><i className="lg-pr" /> PR</span></div>
            <Chart tests={tests.slice(-10)} best={bestPace} />
          </>}
          <p className="note">{message(tests, bestPace, bestTest)}</p>
        </section>
      ) : (
        <section className="panel">
          <h3>Nog geen test</h3>
          <p className="muted">Vul na de test je twee afstanden in. Je krijgt dan meteen je Critical Speed en je tempo&apos;s voor de intervallen.</p>
          <Link className="link" href="/challenge/cs?demo=1">Bekijk een voorbeeld ›</Link>
        </section>
      )}

      {P?.ok && (
        <section className="section" id="tempos">
          <h2>Jouw trainingstempo&apos;s</h2>
          <div className="panel">
            <table className="tempotabel">
              <thead><tr><th>Soort</th><th className="r">Per km</th></tr></thead>
              <tbody>
                <tr><td>VO2max<br /><span className="small muted">Herhalingen van 3–5 min, bv. {'5×1000\u00a0m'}</span></td><td className="r num">{range(P.vo2max)}</td></tr>
                <tr className="basis"><td><span className="tag special">Golden zone</span>Threshold<br /><span className="small muted">Herhalingen van 1–4 min, bv. {'10×1000\u00a0m'}</span></td><td className="r num">{range(P.threshold)}</td></tr>
                <tr className="basis"><td><span className="tag special">Golden zone</span>Sub-threshold<br /><span className="small muted">Blokken van 5–10 min, bv. {'5×5\u00a0min'}</span></td><td className="r num">{range(P.subthreshold)}</td></tr>
                <tr><td>Strides<br /><span className="small muted">15–20 sec ontspannen snel</span></td><td className="r num">{range(P.strides)}</td></tr>
                <tr><td>LT1 · aerobe drempel<br /><span className="small muted">Schatting. De bovengrens van je duurlopen</span></td><td className="r num">{range(P.lt1)}</td></tr>
                <tr><td>Easy · rustige duurloop<br /><span className="small muted">Hele zinnen praten. Langzamer mag altijd</span></td><td className="r num">{range(P.easy)}</td></tr>
              </tbody>
            </table>
            <p className="note"><b>Je drempeltempo ligt rond {range(P.hour)}/km:</b> ongeveer het tempo dat je een uur volhoudt. Wij trainen daar bewust net ónder, in de golden zone, zoals Marius Bakken. Zo train je veel kwaliteit zonder te verzuren. Na afloop moet je het gevoel hebben dat er nog een of twee herhalingen in hadden gezeten.</p>
            <details className="cs-races">
              <summary>Bekijk je geschatte wedstrijdtijden ›</summary>
              <div className="list">
                {P.races.map((r) => (
                  <div key={r.meters} className="row" style={{ gridTemplateColumns: '1fr auto', cursor: 'default' }}>
                    <span><span className="t">{r.meters / 1000} km</span><br /><span className="s">{fmt(r.pace)}/km</span></span>
                    <span className="num" style={{ fontWeight: 700 }}>{fmt(r.time)}</span>
                  </div>
                ))}
              </div>
              <p className="small muted" style={{ margin: 0 }}>Een schatting op basis van je CS-test, bij goede omstandigheden en een vlak parcours.</p>
            </details>
            <Link className="link" href="/tools#threshold">Meer over drempeltraining en hoe het hoort te voelen ›</Link>
          </div>
        </section>
      )}

      {!notSetUp && !demo && (
        <section className="panel">
          {!formOpen ? (
            <button className="link" style={{ alignSelf: 'flex-start' }} onClick={() => setFormOpen(true)}>+ CS-test invullen</button>
          ) : (
            <form className="section" onSubmit={add}>
              <h3>CS-test invullen</h3>
              <div className="grid2">
                <div className="field"><label htmlFor="cs-3">Afstand in 3 min (meter)</label><input className="input num" id="cs-3" value={d3} onChange={(e) => setD3(e.target.value.replace(/\D/g, ''))} placeholder="900" inputMode="numeric" required /></div>
                <div className="field"><label htmlFor="cs-12">Afstand in 12 min (meter)</label><input className="input num" id="cs-12" value={d12} onChange={(e) => setD12(e.target.value.replace(/\D/g, ''))} placeholder="3000" inputMode="numeric" required /></div>
              </div>
              <div className="field"><label htmlFor="cs-d">Datum</label><input className="input" id="cs-d" type="date" value={day} max={today()} onChange={(e) => setDay(e.target.value)} required /></div>
              {n3 && n12 ? (valid(n3, n12)
                ? <p className="small muted" style={{ margin: 0 }}>Dat is een CS van {fmt(csCalc(n3, n12).csPace)}/km en een drempeltempo van {fmt(csPaces(n3, n12).threshold[0])}/km.</p>
                : <p className="small" style={{ margin: 0, color: 'var(--bad, #c0392b)' }}>Deze afstanden kloppen niet helemaal: je 12 minuten moeten per minuut langzamer zijn dan je 3 minuten.</p>) : null}
              <div className="btn-row"><button className="btn btn-gold" type="submit" disabled={!valid(n3, n12)}>Opslaan</button><button className="btn btn-line" type="button" onClick={() => setFormOpen(false)}>Annuleren</button></div>
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
                  <span className="t num">CS {fmt(t.csPace)}/km{t.csPace === bestPace && <span className="tag special" style={{ marginLeft: 8 }}>PR</span>}</span><br />
                  <span className="s">{dateLabel(t.date)} · {m(t.d3)} + {m(t.d12)}</span>
                </span>
                <span style={{ textAlign: 'right' }}>
                  {t.delta != null && <span className={'num small ' + (t.delta > 0 ? 'faster' : t.delta < 0 ? 'slower' : '')}>{secs(t.delta)}/km</span>}
                  {!demo && <><br /><button className="link small" onClick={() => act('deleteCs', { id: t.id }, 'Test verwijderd')}>Verwijder</button></>}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function message(tests, bestPace) {
  const last = tests[tests.length - 1];
  if (tests.length === 1) return 'Je eerste CS-test staat. Over 6 tot 8 weken weer testen: dan zie je of je tempo\'s omhoog kunnen.';
  if (last.csPace === bestPace && last.delta > 0) return `Nieuw PR! Je CS is ${Math.round(last.delta)} sec per km sneller dan de vorige keer. Je tempo's zijn meteen bijgewerkt.`;
  if (last.delta > 0) return 'Sneller dan de vorige keer. Je tempo\'s zijn bijgewerkt.';
  return 'Elke test telt. Je tempo\'s komen altijd uit je laatste test, zodat ze passen bij hoe je nu loopt.';
}

// Lijngrafiek van je CS (sneller = hoger), gestippelde lijn = je PR
function Chart({ tests, best }) {
  const W = 340, H = 170, L = 46, R = 12, T = 18, B = 26;
  const vals = tests.map((t) => t.csPace);
  const mn = Math.min(...vals), mx = Math.max(...vals);
  const pad = Math.max(3, (mx - mn) * 0.15);
  const lo = mn - pad, hi = mx + pad;
  const x = (i) => L + (i * (W - L - R)) / (tests.length - 1);
  const y = (v) => T + ((v - lo) / (hi - lo)) * (H - T - B);
  const pts = tests.map((t, i) => `${x(i)},${y(t.csPace)}`).join(' ');
  const lastT = tests[tests.length - 1];
  return (
    <div className="chart" role="img" aria-label={`Grafiek van je laatste ${tests.length} CS-tests; PR ${fmt(best)} per km`}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
        <line x1={L} x2={W - R} y1={y(best)} y2={y(best)} className="prline" />
        <text x={L - 6} y={y(best) + 4} textAnchor="end" className="axis pr-label">{fmt(best)}</text>
        <polygon points={`${x(0)},${H - B} ${pts} ${x(tests.length - 1)},${H - B}`} className="area" />
        <polyline points={pts} className="line" />
        {tests.map((t, i) => (
          <circle key={t.id} cx={x(i)} cy={y(t.csPace)} r={t.csPace === best ? 6 : 4} className={t.csPace === best ? 'pr' : 'dot'}><title>{`${short(t.date)}: ${fmt(t.csPace)}/km`}</title></circle>
        ))}
        <text x={x(tests.length - 1)} y={y(lastT.csPace) - 10} textAnchor="end" className="axis last-label">{fmt(lastT.csPace)}</text>
        <text x={L} y={H - 7} className="axis">{short(tests[0].date)}</text>
        <text x={W - R} y={H - 7} textAnchor="end" className="axis">{short(lastT.date)}</text>
      </svg>
    </div>
  );
}
