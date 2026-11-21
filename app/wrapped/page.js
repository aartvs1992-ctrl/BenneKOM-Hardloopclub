'use client';
// BenneKOM Wrapped: je clubjaar als story. Tik rechts voor verder, links voor terug.
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import Badge from '@/components/Badge';

const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const day = (iso) => { const d = new Date(iso + 'T12:00:00Z'); return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`; };
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const nl = (n) => Number(n || 0).toLocaleString('nl-NL');

function cards(w) {
  const t = w.tuesdays, out = [];
  out.push({ tone: 'navy', key: 'intro', body: (
    <>
      <div className="w-eb">BenneKOM hardloopclub</div>
      <div className="w-k w-mid" style={{ marginTop: 64 }}>JOUW<br />BENNEKOM<br />JAAR</div>
      <div className="w-k w-big w-g">{w.year}</div>
      <p className="w-p">{w.name ? w.name + ', h' : 'H'}et jaar zit er bijna op.{t.first && t.first > `${w.year}-01-07` ? ` Sinds ${day(t.first)} loop je mee.` : ''} Zo zag jouw jaar met BenneKOM eruit.</p>
    </>
  ) });
  if (t.count) out.push({ tone: 'navy', key: 'dinsdag', foot: t.count >= 10 ? 'Badge: Vaste prik' : '', body: (
    <>
      <div className="w-eb">Jouw dinsdagavonden</div>
      <div className="w-k w-mid" style={{ marginTop: 16 }}>DINSDAG IS<br />BENNEKOM-DAG</div>
      <div className="w-grid">
        <div className="w-tile"><b className="w-k">{t.count}</b><span>{t.count === 1 ? 'dinsdag' : 'dinsdagen'} erbij</span></div>
        {t.km > 0
          ? <div className="w-tile"><b className="w-k">{nl(t.km)}</b><span>km op dinsdag</span></div>
          : <div className="w-tile"><b className="w-k">{t.intervals}</b><span>intervalavonden</span></div>}
        <div className="w-tile"><b className="w-k">{t.hours}</b><span>uur samen onderweg</span></div>
        {t.busiest
          ? <div className="w-tile"><b className="w-k">{t.busiest.n}</b><span>lopers op je drukste avond ({day(t.busiest.date)})</span></div>
          : <div className="w-tile"><b className="w-k">{t.streak}</b><span>dinsdagen op rij</span></div>}
      </div>
      <p className="w-p" style={{ fontSize: 14 }}>{t.streak >= 3 ? `Je langste reeks: ${t.streak} dinsdagen op rij.` : 'Duurloop of intervallen, regen of zon: je was erbij.'}</p>
    </>
  ) });
  if (w.fastest) out.push({ tone: 'gold', key: 'km', foot: 'Bron: Strava', body: (
    <>
      <div className="w-eb">Intervalavonden</div>
      <div className="w-k w-mid" style={{ marginTop: 40 }}>JE SNELSTE<br />KILOMETER<br />OP EEN DINSDAG</div>
      <div className="w-k w-big" style={{ color: '#F4F1E6' }}>{mmss(w.fastest.seconds)}</div>
      <p className="w-p">Op {day(w.fastest.date)}, tijdens de intervaltraining.</p>
    </>
  ) });
  else if (t.count) out.push({ tone: 'gold', key: 'soort', body: (
    <>
      <div className="w-eb">Interval of duurloop?</div>
      <div className="w-k w-big" style={{ marginTop: 40, color: '#F4F1E6' }}>{t.intervals}</div>
      <div className="w-k w-mid">INTERVAL-<br />AVONDEN</div>
      <p className="w-p">En {t.duurlopen} {t.duurlopen === 1 ? 'duurloop' : 'duurlopen'}. {t.intervals > t.duurlopen ? 'Jij houdt van tempo.' : 'Jij geniet van de kilometers samen.'}</p>
    </>
  ) });
  if (w.challenge) {
    const c = w.challenge, gain = c.first.seconds - c.best.seconds;
    out.push({ tone: 'navy', key: 'challenge', foot: gain > 0 ? 'Sneller dan je begon' : '', body: (
      <>
        <div className="w-eb">5km Challenge</div>
        <div className="w-k w-mid" style={{ marginTop: 28 }}>{c.count} KEER<br />AAN DE START</div>
        <div style={{ marginTop: 16 }}>
          {gain > 0 && <div className="w-row"><span>Eerste keer · {day(c.first.date)}</span><b className="w-k w-sm">{mmss(c.first.seconds)}</b></div>}
          <div className="w-row"><span>Snelste · {day(c.best.date)}</span><b className="w-k w-sm w-g">{mmss(c.best.seconds)}</b></div>
        </div>
        {gain > 0 && <div className="w-k w-mid w-g" style={{ marginTop: 6 }}>−{mmss(gain)}</div>}
        <p className="w-p" style={{ fontSize: 14 }}>Tegen jezelf gelopen{gain > 0 ? ', en gewonnen.' : '.'}</p>
      </>
    ) });
  }
  const samen = w.samen.org + w.samen.join;
  if (samen || w.specials.length) out.push({ tone: 'cream', key: 'samen', body: (
    <>
      <div className="w-eb">Meer dan de dinsdag</div>
      {samen > 0 ? (
        <>
          <div className="w-k w-big" style={{ marginTop: 28, color: '#C99A1E' }}>{samen}</div>
          <div className="w-k w-mid">{samen === 1 ? 'LOOPJE' : 'LOOPJES'} SAMEN<br />BUITEN DE DINSDAG</div>
          {w.samen.org > 0 && <p className="w-p" style={{ fontSize: 14 }}>Waarvan {w.samen.org} zelf georganiseerd. Gangmaker!</p>}
        </>
      ) : <div className="w-k w-mid" style={{ marginTop: 40 }}>DE SPECIALS<br />VAN {w.year}</div>}
      {w.specials.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {w.specials.map((s) => <div className="w-row dark" key={s.name}><span>{s.name}</span><span>{s.distance > 1000 ? `${nl(Math.round(s.distance / 100) / 10)} km` : day(s.date)}</span></div>)}
        </div>
      )}
    </>
  ) });
  if (w.badges.count) out.push({ tone: 'navy', key: 'badges', body: (
    <>
      <div className="w-eb">Badges</div>
      <div className="w-k w-big w-g" style={{ marginTop: 28 }}>{w.badges.count}</div>
      <div className="w-k w-mid">BADGES<br />VERDIEND</div>
      {w.badges.top.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          {w.badges.top.map((b) => <div key={b.id} style={{ textAlign: 'center', flex: 1 }}><Badge b={b} size={72} /><div style={{ fontSize: 12, marginTop: 4 }}>{b.name}</div></div>)}
        </div>
      )}
    </>
  ) });
  out.push({ tone: 'gold', key: 'club', foot: 'De club als geheel', body: (
    <>
      <div className="w-eb">De club in {w.year}</div>
      <div className="w-grid">
        <div className="w-tile"><b className="w-k">{w.club.members}</b><span>lopers in de app</span></div>
        <div className="w-tile"><b className="w-k">{w.club.trainings}</b><span>dinsdagtrainingen</span></div>
        <div className="w-tile"><b className="w-k">{nl(w.club.signups)}</b><span>keer &quot;ik ben erbij&quot;</span></div>
        <div className="w-tile"><b className="w-k">{w.club.maxGroup}</b><span>lopers op de drukste avond</span></div>
      </div>
      <p className="w-p" style={{ fontSize: 14 }}>En jij hoorde erbij. Samen sneller, samen gezelliger.</p>
    </>
  ) });
  out.push({ tone: 'navy', key: 'outro', share: true, body: (
    <>
      <div className="w-eb">Op naar {w.year + 1}</div>
      <div className="w-k w-mid" style={{ marginTop: 64 }}>BEDANKT<br />VOOR EEN<br />TOPJAAR</div>
      <div className="w-k w-mid w-g" style={{ marginTop: 14 }}>TOT DINSDAG</div>
    </>
  ) });
  return out;
}

// Deelplaatje (1080 × 1920) met de hoofdgetallen
async function shareImage(w) {
  await document.fonts?.ready;
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1920;
  const x = c.getContext('2d');
  x.fillStyle = '#071E3E'; x.fillRect(0, 0, 1080, 1920);
  x.fillStyle = '#C99A1E'; x.fillRect(0, 0, 1080, 14);
  const D = (s, px) => { x.font = `700 ${px}px "Barlow Condensed", "Arial Narrow", sans-serif`; };
  x.fillStyle = '#F4F1E6'; D(0, 44); x.fillText('BENNEKOM HARDLOOPCLUB', 90, 150);
  D(0, 150); x.fillText('MIJN', 90, 340); x.fillText('BENNEKOM', 90, 480); x.fillText('JAAR', 90, 620);
  x.fillStyle = '#E2B74A'; D(0, 260); x.fillText(String(w.year), 80, 860);
  const stats = [
    [w.tuesdays.count, 'DINSDAGEN ERBIJ'],
    w.fastest ? [mmss(w.fastest.seconds), 'SNELSTE KM OP DINSDAG'] : w.tuesdays.km ? [nl(w.tuesdays.km), 'KM OP DINSDAG'] : [w.tuesdays.hours, 'UUR SAMEN ONDERWEG'],
    w.challenge ? [mmss(w.challenge.best.seconds), 'SNELSTE 5KM CHALLENGE'] : [w.samen.org + w.samen.join, 'LOOPJES SAMEN'],
    [w.badges.count, 'BADGES VERDIEND'],
  ];
  stats.forEach(([n, label], i) => {
    const y = 1030 + i * 200;
    x.fillStyle = 'rgba(244,241,230,.15)'; x.fillRect(90, y - 120, 900, 2);
    x.fillStyle = '#E2B74A'; D(0, 130); x.fillText(String(n), 90, y + 30);
    x.fillStyle = '#F4F1E6'; D(0, 46); x.fillText(label, 470, y + 10);
  });
  x.fillStyle = '#C99A1E'; D(0, 52); x.fillText('BENNEKOMHARDLOOPCLUB.APP', 90, 1830);
  const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
  const file = new File([blob], `bennekom-${w.year}.png`, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: `Mijn BenneKOM-jaar ${w.year}` }); return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
}

export default function Wrapped() {
  const { local } = useApp();
  const [w, setW] = useState(null);
  const [err, setErr] = useState('');
  const [i, setI] = useState(0);
  useEffect(() => {
    const demo = new URLSearchParams(location.search).has('demo');
    if (!demo && !local?.device) return;
    fetch(demo ? '/api/wrapped?demo' : '/api/wrapped?device=' + encodeURIComponent(local.device), { cache: 'no-store' })
      .then((r) => r.json()).then((j) => (j.error ? setErr(j.error) : setW(j))).catch(() => setErr('Je jaaroverzicht laden lukte niet.'));
  }, [local?.device]);
  const list = useMemo(() => (w ? cards(w) : []), [w]);

  if (err) return <div className="wrap" style={{ paddingBlock: 24 }}><p>{err}</p><Link className="link" href="/">Terug naar home</Link></div>;
  if (!w) return <div className="wrap" style={{ paddingBlock: 24 }}><div className="skeleton" style={{ minHeight: 480 }} /></div>;
  const c = list[Math.min(i, list.length - 1)];
  const tap = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    if (e.clientX - r.left < r.width / 3) setI((n) => Math.max(0, n - 1));
    else setI((n) => Math.min(list.length - 1, n + 1));
  };
  return (
    <div className="wrap wrapped">
      <div className="w-bar">{list.map((x, n) => <span key={x.key} className={n <= i ? 'on' : ''} />)}</div>
      <div className={'w-card ' + c.tone} onClick={tap} role="button" tabIndex={0} aria-label="Volgende kaart"
        onKeyDown={(e) => { if (e.key === 'ArrowLeft') setI((n) => Math.max(0, n - 1)); if (e.key === 'ArrowRight' || e.key === ' ') setI((n) => Math.min(list.length - 1, n + 1)); }}>
        {c.body}
        {c.share && (
          <button className="w-share" onClick={(e) => { e.stopPropagation(); shareImage(w).catch(() => {}); }}>Deel je jaar</button>
        )}
        <div className="w-foot"><span>{c.foot || (i === 0 ? 'Tik verder' : '')}</span><span>{i + 1}/{list.length}</span></div>
      </div>
      {w.demo && <p className="small muted" style={{ textAlign: 'center' }}>Voorbeeld met een verzonnen lid.</p>}
      {!w.strava && !w.demo && <p className="small muted" style={{ textAlign: 'center' }}>Koppel Strava bij <Link className="link" href="/badges">Mijn badges</Link> voor nog meer cijfers.</p>}
      <p style={{ textAlign: 'center' }}><Link className="link" href="/">Terug naar home</Link></p>
    </div>
  );
}
