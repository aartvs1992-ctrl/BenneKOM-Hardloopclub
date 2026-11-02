'use client';
import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import { EventRow, Loading, ErrorNote, useReady, AttendButton } from '@/components/ui';
import { dparts, rel } from '@/lib/content';
import { CLUB } from '@/lib/club';
import InstallBanner from '@/components/InstallBanner';

export default function Home() {
  const { data, local, act } = useApp();
  if (!useReady()) return <Loading />;

  const next = data.events.find((e) => e.type === 'training' || e.replaces_training);
  const specials = data.events.filter((e) => e.type === 'special' && e.id !== next?.id).slice(0, 2);
  const chal = data.events.find((e) => e.type === 'challenge');
  const race = data.events.find((e) => e.type === 'wedstrijd');

  return (
    <>
      <ErrorNote />
      <InstallBanner />
      {next && <NextTraining e={next} />}

      <section className="section">
        <div className="section-head"><h2>Doe mee</h2><Link className="link" href="/agenda">Hele agenda ›</Link></div>
        <div className="list">
          {specials.map((e) => <EventRow key={e.id} e={e} />)}
          {chal && <EventRow e={chal} />}
        </div>
      </section>

      {race && (
        <section className="section">
          <h2>Race in de regio</h2>
          <div className="panel">
            <div>
              <span className="eyebrow">{dparts(race.date).d} {dparts(race.date).m} · {rel(race.date)}</span>
              <h3>{race.title}</h3>
              {race.distances && <p className="muted small">{race.distances}</p>}
            </div>
            <div className="btn-row">
              <Link className="btn btn-gold btn-sm" href={'/event/' + race.id}>Carpool regelen</Link>
              <span className="small muted" style={{ alignSelf: 'center' }}>
                {(data.rides[race.id] || []).reduce((a, r) => a + r.left, 0)} plekken vrij
              </span>
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <h2>Handig</h2>
        <div className="tiles">
          <Link className="tile" href="/tools"><span className="k">Calculator</span><span className="v">Tempo, voorspeller, zones, splits</span></Link>
          <Link className="tile" href="/voeding"><span className="k">Voeding</span><span className="v">Je persoonlijke raceplan</span></Link>
          <Link className="tile" href="/leren"><span className="k">Leren</span><span className="v">{local.done.length}/15 modules gelezen</span></Link>
          <Link className="tile" href="/nieuws"><span className="k">Nieuws</span><span className="v">Van de club en Strava</span></Link>
        </div>
      </section>
    </>
  );

}

function NextTraining({ e }) {
    const { data, local, act } = useApp();
    const p = dparts(e.date);
    const going = Boolean(data.mine[e.id]);
    const n = data.counts[e.id] || 0;
    return (
      <section className="hero">
        <span className="eyebrow">Volgende clubtraining · {rel(e.date)}</span>
        <h1>{p.W} {p.d} {p.m}</h1>
        <div className="meta"><span className="num">{e.time}</span><span>{e.place}</span></div>
        <div className="count"><span className="n num">{n}</span><span>{n === 1 ? 'loper komt' : 'lopers komen'}</span></div>
        <div className="btn-row">
          <AttendButton e={e} going={going} act={act} local={local} />
          <a className="btn btn-line" href={CLUB.strava} target="_blank" rel="noopener noreferrer">Strava</a>
        </div>
        <span className="slogan">Samen=LEUKER</span>
      </section>
    );
  }
