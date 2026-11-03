'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import { Loading, ErrorNote, useReady, PhotoHeader } from '@/components/ui';
import { dparts, rel, fmt, parseT, MON } from '@/lib/content';
import { CHALLENGE_EASY, CHALLENGE_PHOTOS } from '@/lib/challenge';
import { Gallery } from '@/components/Gallery';

const STATUS = {
  ok: 'Strava gekoppeld! Je tijden op het segment worden opgehaald.',
  geweigerd: 'Je hebt Strava geen toegang gegeven. Je kunt je tijd ook zelf invullen.',
  fout: 'Koppelen met Strava lukte niet. Probeer het nog eens.',
  uit: 'De Strava-koppeling is nog niet ingesteld door de beheerder.',
};

const dateLabel = (iso) => { const d = new Date(iso); return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`; };
const signed = (s) => (s < 0 ? '−' : '+') + fmt(Math.abs(s));

// Laatste zaterdag van de huidige of vorige maand (standaard voor handmatig invullen)
function lastChallengeDate() {
  const d = new Date();
  for (let back = 0; back < 2; back++) {
    const last = new Date(d.getFullYear(), d.getMonth() + 1 - back, 0);
    while (last.getDay() !== 6) last.setDate(last.getDate() - 1);
    if (last <= d) return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`;
  }
  return d.toISOString().slice(0, 10);
}

export default function Challenge() {
  const { data, local, act, toast } = useApp();
  const [sv, setSv] = useState(null); // Strava-gegevens van dit apparaat
  const [busy, setBusy] = useState(false);
  const [sure, setSure] = useState(false);
  const [t, setT] = useState('');
  const [day, setDay] = useState(lastChallengeDate);
  const [manualOpen, setManualOpen] = useState(false);
  const [stravaMsg, setStravaMsg] = useState('');

  const load = useCallback(async () => {
    if (!local?.device) return;
    try {
      const r = await fetch('/api/strava/me?device=' + encodeURIComponent(local.device), { cache: 'no-store' });
      setSv(await r.json());
    } catch { setSv({ configured: false, connected: false, efforts: [] }); }
  }, [local?.device]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const s = q.get('strava');
    if (s && STATUS[s]) { toast(STATUS[s]); setStravaMsg(s === 'ok' ? '' : (q.get('why') || STATUS[s])); history.replaceState(null, '', '/challenge'); }
  }, [toast]);

  const ready = useReady();
  if (!ready || !sv) return <Loading />;

  const manual = data.results.map((r) => ({
    id: r.id, seconds: r.seconds, source: 'handmatig',
    date: /^\d{4}-\d{2}-\d{2}$/.test(r.edition) ? r.edition + 'T10:00:00' : r.date || r.edition,
  }));
  const attempts = [...(sv.efforts || []), ...manual].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  attempts.forEach((a, i) => { a.delta = i ? a.seconds - attempts[i - 1].seconds : null; });
  // PR: het officiële all-time PR van Strava gaat voor; anders de snelste tijd die we kennen
  const official = sv.pr?.seconds || null;
  const known = attempts.length ? Math.min(...attempts.map((a) => a.seconds)) : null;
  const best = official ? Math.min(official, known ?? Infinity) : known;
  const prDate = official && official === best ? sv.pr.date : attempts.find((a) => a.seconds === best)?.date;
  const recent = attempts.slice(-10);
  const last = attempts[attempts.length - 1];
  const next = data.events.find((e) => e.type === 'challenge');

  async function strava(action, okMsg) {
    setBusy(true);
    try {
      const r = await fetch('/api/strava/me', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, device: local.device }) });
      const j = await r.json();
      if (!r.ok) toast(j.error || 'Dat lukte niet.');
      else { setSv(j); toast(j.note || okMsg); }
    } catch { toast('Geen verbinding. Probeer het zo nog eens.'); }
    finally { setBusy(false); setSure(false); }
  }

  async function addManual(ev) {
    ev.preventDefault();
    if (!local.name) { location.href = '/profiel?terug=1'; return; }
    const s = parseT(t);
    if (Number.isNaN(s)) return;
    if (await act('addResult', { seconds: s, edition: day }, best && s < best ? `Nieuw PR: ${fmt(s)}!` : 'Tijd opgeslagen')) { setT(''); setManualOpen(false); }
  }

  return (
    <>
      <PhotoHeader src="/club/challenge-start.jpg" title="Jouw 5 km" sub="Elke laatste zaterdag van de maand. Je loopt tegen jezelf, en samen is het leuker." pos="center 35%" />
      <ErrorNote />

      {next && (
        <Link className="panel" href={'/event/' + next.id} style={{ textDecoration: 'none', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <span><span className="eyebrow">Volgende editie · {rel(next.date)}</span><br /><b style={{ fontSize: 18 }}>{dparts(next.date).w} {dparts(next.date).d} {dparts(next.date).m} · {next.time || '10:00'}</b></span>
          <span className="btn btn-gold btn-sm">{data.mine[next.id] ? '✓ Ingeschreven' : 'Inschrijven'}</span>
        </Link>
      )}

      <div className="panel callout">
        <b>{CHALLENGE_EASY.title}</b>
        <p>{CHALLENGE_EASY.text}</p>
      </div>

      {attempts.length || official ? (
        <section className="panel">
          <div className="section-head"><h3>Jouw stand</h3><span className="small muted">{sv.pr?.count || attempts.length} {(sv.pr?.count || attempts.length) === 1 ? 'poging' : 'pogingen'}</span></div>
          <div className="pr-big">
            <span className="lbl">Persoonlijk record{official ? ' · all-time volgens Strava' : ''}</span>
            <span className="num">{fmt(best)}</span>
            <span className="small muted">{fmt(best / 5)} per km{prDate ? ' · ' + dateLabel(prDate) : ''}
              {official && sv.pr.activity && <> · <a href={`https://www.strava.com/activities/${sv.pr.activity}`} target="_blank" rel="noopener noreferrer">bekijk op Strava</a></>}</span>
          </div>
          {last && <>
          <div className="readout">
            <div><span className="lbl">Laatste keer</span><span className="big">{fmt(last.seconds)}</span><span className="lbl">{dateLabel(last.date)}</span></div>
            <div><span className="lbl">T.o.v. vorige</span>
              <span className={'big ' + (last.delta == null ? '' : last.delta < 0 ? 'faster' : last.delta > 0 ? 'slower' : '')}>{last.delta == null ? '–' : signed(last.delta)}</span>
              <span className="lbl">{last.delta == null ? 'eerste poging' : last.delta < 0 ? 'sneller' : last.delta > 0 ? 'trager' : 'gelijk'}</span></div>
            <div><span className="lbl">Tot je PR</span><span className="big">{last.seconds === best ? '★' : signed(last.seconds - best)}</span><span className="lbl">{last.seconds === best ? 'dit is je PR!' : 'nog te winnen'}</span></div>
          </div>
          {recent.length > 1 && <>
            <div className="section-head"><b>Laatste {recent.length} pogingen</b><span className="small muted legend"><i className="lg-pr" /> PR</span></div>
            <Chart attempts={recent} best={best} />
          </>}
          <p className="note">{message(attempts, best)}</p>
          </>}
        </section>
      ) : (
        <section className="panel">
          <h3>Nog geen tijden</h3>
          <p className="muted">Koppel je Strava, dan verschijnen je tijden op het Challenge-segment hier vanzelf. Of vul je tijd zelf in.</p>
        </section>
      )}

      <section className="panel">
        <div className="section-head"><h3>Strava</h3><a className="link" href={sv.segment?.url} target="_blank" rel="noopener noreferrer">Bekijk het segment ↗</a></div>
        {stravaMsg && <p className="err">Koppelen lukte niet. {stravaMsg}</p>}
        {!sv.configured ? (
          <p className="muted small">De koppeling met Strava wordt binnenkort ingesteld. Tot die tijd vul je je tijd zelf in.</p>
        ) : sv.connected ? (
          <>
            <p className="small">Gekoppeld{sv.firstname ? ` als ${sv.firstname}` : ''}. Na elke loop over het segment staat je tijd hier vanzelf.{sv.lastSync ? ` Laatst bijgewerkt ${new Date(sv.lastSync).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}.` : ''}</p>
            {sv.note && <p className="note">{sv.note}</p>}
            <div className="btn-row">
              <button className="btn btn-line btn-sm" disabled={busy} onClick={() => strava('refresh', 'Bijgewerkt')}>{busy ? 'Bezig…' : 'Nu bijwerken'}</button>
              {sure
                ? <button className="btn btn-sm btn-danger" disabled={busy} onClick={() => strava('disconnect', 'Strava ontkoppeld en je Strava-tijden verwijderd')}>Zeker ontkoppelen?</button>
                : <button className="btn btn-line btn-sm" onClick={() => setSure(true)}>Ontkoppelen</button>}
            </div>
            <p className="small muted">Je Strava-tijden ziet alleen jij. Bij ontkoppelen verwijdert de app ze.</p>
          </>
        ) : (
          <>
            <p className="small">Koppel je Strava. De app zoekt dan in je eigen loopjes je tijden op het Challenge-segment. Alleen jij ziet ze.</p>
            <a className="btn btn-strava" href={'/api/strava/connect?device=' + encodeURIComponent(local.device)}>Koppel met Strava</a>
          </>
        )}
      </section>

      <section className="panel">
        {!manualOpen ? (
          <button className="link" style={{ alignSelf: 'flex-start' }} onClick={() => setManualOpen(true)}>+ Tijd zelf invullen</button>
        ) : (
          <form className="section" onSubmit={addManual}>
            <h3>Tijd zelf invullen</h3>
            <div className="grid2">
              <div className="field"><label htmlFor="ch-time">Tijd (mm:ss)</label><input className="input num" id="ch-time" value={t} onChange={(e) => setT(e.target.value)} placeholder="22:45" inputMode="numeric" pattern="\d{1,2}[:.]\d{2}" required /></div>
              <div className="field"><label htmlFor="ch-day">Datum</label><input className="input" id="ch-day" type="date" value={day} onChange={(e) => setDay(e.target.value)} required /></div>
            </div>
            <div className="btn-row"><button className="btn btn-gold" type="submit">Opslaan</button><button className="btn btn-line" type="button" onClick={() => setManualOpen(false)}>Annuleren</button></div>
          </form>
        )}
      </section>

      {attempts.length > 0 && (
        <section className="section">
          <h2>Al je pogingen</h2>
          <div className="list">
            {[...attempts].reverse().map((a) => (
              <div key={a.source + a.id} className="row" style={{ gridTemplateColumns: '1fr auto', cursor: 'default' }}>
                <span style={{ minWidth: 0 }}>
                  <span className="t num">{fmt(a.seconds)}{a.seconds === best && <span className="tag special" style={{ marginLeft: 8 }}>PR</span>}</span><br />
                  <span className="s">{dateLabel(a.date)} · {fmt(a.seconds / 5)}/km · {a.source === 'strava' ? <a href={`https://www.strava.com/activities/${a.activity}`} target="_blank" rel="noopener noreferrer">Strava</a> : 'zelf ingevuld'}</span>
                </span>
                <span style={{ textAlign: 'right' }}>
                  {a.delta != null && <span className={'num small ' + (a.delta < 0 ? 'faster' : a.delta > 0 ? 'slower' : '')}>{signed(a.delta)}</span>}
                  {a.source === 'handmatig' && <><br /><button className="link small" onClick={() => act('deleteResult', { id: a.id }, 'Tijd verwijderd')}>Verwijder</button></>}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
      <section className="section">
        <h2>Zo ziet een Challenge eruit</h2>
        <Gallery photos={CHALLENGE_PHOTOS} />
      </section>
    </>
  );
}

function message(attempts, best) {
  const last = attempts[attempts.length - 1];
  if (attempts.length === 1) return 'Je eerste tijd staat. Volgende keer probeer je hem te verbeteren.';
  if (last.seconds === best && last.delta < 0) return `Nieuw PR! ${fmt(Math.abs(last.delta))} sneller dan de vorige keer.`;
  if (last.delta < 0) return `Sneller dan de vorige keer. Nog ${fmt(last.seconds - best)} tot je PR.`;
  const first = attempts[0].seconds;
  if (best < first) return `Sinds je eerste poging ben je ${fmt(first - best)} sneller geworden.`;
  return 'Elke poging telt. Volgende keer pak je hem!';
}

// Lijngrafiek van je laatste pogingen; sneller = hoger, gestippelde lijn = je PR
function Chart({ attempts, best }) {
  const W = 340, H = 170, L = 46, R = 12, T = 18, B = 26;
  const secs = attempts.map((a) => a.seconds);
  const mn = Math.min(best, ...secs), mx = Math.max(...secs);
  const pad = Math.max(8, (mx - mn) * 0.12);
  const lo = mn - pad, hi = mx + pad;
  const x = (i) => L + (i * (W - L - R)) / (attempts.length - 1);
  const y = (sec) => T + ((sec - lo) / (hi - lo)) * (H - T - B);
  const pts = attempts.map((a, i) => `${x(i)},${y(a.seconds)}`).join(' ');
  const short = (iso) => { const d = new Date(iso); return `${d.getDate()} ${MON[d.getMonth()]}`; };
  return (
    <div className="chart" role="img" aria-label={`Grafiek van je laatste ${attempts.length} tijden; PR ${fmt(best)}`}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
        {[mx].filter((v) => v !== best).map((v) => (
          <g key={v}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="grid" /><text x={L - 6} y={y(v) + 4} textAnchor="end" className="axis">{fmt(v)}</text></g>
        ))}
        <line x1={L} x2={W - R} y1={y(best)} y2={y(best)} className="prline" />
        <text x={L - 6} y={y(best) + 4} textAnchor="end" className="axis pr-label">{fmt(best)}</text>
        <polygon points={`${x(0)},${H - B} ${pts} ${x(attempts.length - 1)},${H - B}`} className="area" />
        <polyline points={pts} className="line" />
        {attempts.map((a, i) => (
          <circle key={i} cx={x(i)} cy={y(a.seconds)} r={a.seconds === best ? 6 : 4} className={a.seconds === best ? 'pr' : 'dot'}><title>{`${short(a.date)}: ${fmt(a.seconds)}`}</title></circle>
        ))}
        <text x={x(attempts.length - 1)} y={y(attempts[attempts.length - 1].seconds) - 10} textAnchor="end" className="axis last-label">{fmt(attempts[attempts.length - 1].seconds)}</text>
        <text x={L} y={H - 7} className="axis">{short(attempts[0].date)}</text>
        <text x={W - R} y={H - 7} textAnchor="end" className="axis">{short(attempts[attempts.length - 1].date)}</text>
      </svg>
    </div>
  );
}
