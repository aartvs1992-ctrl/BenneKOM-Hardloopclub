import Link from 'next/link';
import { ZONES } from '@/lib/workouts';

// Interval-strook: elk blok is zo breed als het duurt en zo hoog als het zwaar is
function Strip({ w }) {
  const segs = [{ kind: 'easy', min: 10, level: 1 }];
  for (const s of w.sets) {
    for (let i = 0; i < s.reps; i++) {
      segs.push({ kind: 'work', min: s.workMin, level: ZONES[s.zone].level, zone: s.zone });
      if (s.restMin && i < s.reps - 1) segs.push({ kind: 'rest', min: s.restMin, level: 0.4 });
    }
    segs.push({ kind: 'rest', min: 2, level: 0.4 });
  }
  segs.pop();
  segs.push({ kind: 'easy', min: 8, level: 1 });
  const total = segs.reduce((a, s) => a + s.min, 0);
  return (
    <div className="wo-strip" aria-hidden="true">
      {segs.map((s, i) => (
        <span key={i} className={'wo-seg ' + s.kind + (s.zone ? ' z-' + s.zone : '')} style={{ flexGrow: s.min / total, height: (s.level / 5) * 100 + '%' }} />
      ))}
    </div>
  );
}

export function Workout({ w }) {
  return (
    <section className="workout">
      <span className="eyebrow">Op het programma</span>
      <h2 className="wo-title">{w.title}</h2>
      {w.intro && <p className="wo-intro">{w.intro}</p>}
      <Strip w={w} />
      <ol className="wo-steps">
        <li className="wo-step easy"><span className="wo-big">In</span><span><b>{w.warm}</b>{w.warmNote && <span className="small"> · {w.warmNote}</span>}<br /><span className="small">Rustig, samen</span></span></li>
        {w.sets.map((s, i) => (
          <li key={i} className={'wo-step z-' + s.zone}>
            <span className="wo-big num">{s.reps}×</span>
            <span>
              <b>{s.label || `${s.reps} × ${s.work}`}</b>{s.label && <span className="small"> · {s.work}</span>}<br />
              {ZONES[s.zone].hidden ? <span className="wo-chip">{ZONES[s.zone].short}</span> : <Link className="wo-chip" href={'/tools#' + s.zone}>{ZONES[s.zone].short} ›</Link>}
              <span className="small"> {s.rest}</span>
              {s.note && <span className="wo-note">{s.note}</span>}
            </span>
          </li>
        ))}
        <li className="wo-step easy"><span className="wo-big">Uit</span><span><b>{w.cool}</b><br /><span className="small">Rustig, samen</span></span></li>
      </ol>
      <div className="wo-explain">
        {[...new Set(w.sets.map((s) => s.zone))].filter((z) => z !== 'hard').map((z) => (
          <p key={z}>
            <b>Wat is {ZONES[z].short}?</b> {ZONES[z].summary}{' '}
            {!ZONES[z].hidden && <Link className="wo-more" href={'/tools#' + z}>Meer over {ZONES[z].short} ›</Link>}
          </p>
        ))}
      </div>
      <Link className="link wo-more" href="/tools">Alle tempo&apos;s: threshold, VO2max, strides, fartlek ›</Link>
    </section>
  );
}
