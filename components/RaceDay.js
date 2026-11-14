'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from './AppProvider';
import { Avatar } from './ui';
import { RACE_DAY, raceDay, shareUrl, afterHour } from '@/lib/raceday';
import { todayISO } from '@/lib/club';

const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

// Welke wedstrijd verdient vandaag een racedag-kaart? Wedstrijden waar BenneKOM'ers meedoen gaan voor,
// daarna: vandaag, morgen, gisteren. Wedstrijden met eigen teksten (RACE_DAY) tonen ook zonder aanmeldingen.
export function pickRace(data) {
  const today = todayISO();
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', hour: '2-digit', hourCycle: 'h23' }).format(new Date()));
  const n = (e) => data.counts[e.id] || 0;
  const cands = [];
  for (const e of [...(data.events || []), ...(data.past || [])]) {
    if (e.type !== 'wedstrijd') continue;
    let phase = null, rank = 0;
    if (e.date === today) { phase = hour >= afterHour(e) ? 'after' : 'today'; rank = phase === 'today' ? 3 : 1; }
    else if (e.date === addDays(today, 1)) { phase = 'tomorrow'; rank = 2; }
    else if (e.date === addDays(today, -1)) { phase = 'after'; rank = 0; }
    if (!phase) continue;
    if (!n(e) && (phase === 'after' || !RACE_DAY[e.title])) continue;
    cands.push({ e, phase, score: (n(e) ? 1000 : 0) + rank * 100 + Math.min(n(e), 99) });
  }
  cands.sort((a, b) => b.score - a.score);
  return cands[0] ? { e: cands[0].e, phase: cands[0].phase } : null;
}

// Zeven (of een paar) heuvels, als achtergrond van de kaart
function Hills({ n = 7 }) {
  const w = 400, h = 90, step = w / n;
  let d = `M0 ${h}`;
  for (let i = 0; i < n; i++) {
    const top = 18 + ((i * 37) % 5) * 9;
    d += ` Q ${step * i + step / 2} ${top - 22} ${step * (i + 1)} ${h - 14}`;
  }
  d += ` L ${w} ${h} Z`;
  return (
    <svg className="rd-hills" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

// Eerst schermvullend (één keer per wedstrijd en fase), daarna als kaart bovenaan de normale pagina
export default function RaceDay({ pick }) {
  const key = pick ? `bk-raceday:${pick.e.id}:${pick.phase}` : '';
  const [full, setFull] = useState(false);
  useEffect(() => {
    if (!key) return;
    let seen = false;
    try { seen = localStorage.getItem(key) === '1'; } catch {}
    setFull(!seen);
  }, [key]);
  useEffect(() => {
    if (!full) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [full]);
  if (!pick) return null;
  const close = () => { try { localStorage.setItem(key, '1'); } catch {} setFull(false); };
  return (
    <>
      {full && (
        <div className="race-day-full" role="dialog" aria-modal="true" aria-label={pick.e.title}>
          <Card pick={pick} full onClose={close} />
        </div>
      )}
      <Card pick={pick} />
    </>
  );
}

function Card({ pick, full = false, onClose }) {
  const { data, local } = useApp();
  const { e, phase } = pick;
  const t = raceDay(e);
  const n = data.counts[e.id] || 0;
  const people = data.names[e.id] || [];
  const mine = Boolean(data.mine[e.id]);
  const first = (local?.name || '').split(' ')[0];
  const when = phase === 'tomorrow' ? 'Morgen' : phase === 'today' ? 'Vandaag' : 'Net gelopen';
  const place = (e.place || '').split(',')[0];

  return (
    <section className={'race-day' + (full ? ' full' : '') + (t.image ? ' has-img' : '')} style={t.image ? { backgroundImage: `url("${t.image}")` } : undefined}>
      {full && <button type="button" className="rd-close" onClick={onClose} aria-label="Sluiten">×</button>}
      <Hills n={t.hills} />
      <span className="eyebrow">{when} · {e.title}{phase !== 'after' && (e.time || place) ? ' · ' + [e.time, place].filter(Boolean).join(' · ') : ''}</span>
      <h2>{phase === 'after' ? 'Wat een prestatie!' : t.headline}</h2>

      {phase !== 'after' && mine && (
        <p className="rd-good"><b>{first ? `Succes${phase === 'tomorrow' ? ' morgen' : ''}, ${first}!` : 'Succes!'}</b> {t.good.replace(/^Succes[^!]*!\s*/, '')}</p>
      )}

      {n > 0 && (
        <div className="rd-who">
          <span className="stack">{people.slice(0, 8).map((p, i) => <Avatar key={i} name={p.name} src={p.avatar} size={30} />)}</span>
          <span className="small"><b className="num">{n}</b> {n === 1 ? 'BenneKOM\'er' : 'BenneKOM\'ers'} {phase === 'after' ? (n === 1 ? 'liep' : 'liepen') : (n === 1 ? 'loopt' : 'lopen')} mee</span>
        </div>
      )}

      <p className="rd-cheer">{phase === 'after' ? t.after : t.cheer}</p>
      {phase !== 'after' && <p className="small rd-share-hint">Sta je langs de kant of loop je mee? Deel je gave beelden en je verhaal in de app 📸</p>}

      <div className="btn-row">
        <Link className="btn btn-gold" href={shareUrl(e)}>📸 Deel je beelden</Link>
        <Link className="btn btn-line" href={'/event/' + e.id}>{phase === 'after' ? 'Wie liepen er ›' : mine ? 'Wie lopen er ›' : 'Loop jij ook? ›'}</Link>
      </div>
      {full && <button type="button" className="rd-skip" onClick={onClose}>Verder naar de app ›</button>}
    </section>
  );
}
