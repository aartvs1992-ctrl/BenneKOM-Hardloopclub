'use client';
import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import { EventRow, Loading, ErrorNote, useReady, AttendButton, Avatar, People } from '@/components/ui';
import { dparts, rel } from '@/lib/content';
import { CLUB, CLUB_PHOTOS } from '@/lib/club';
import { usePhotos } from '@/lib/usePhotos';
import InstallBanner from '@/components/InstallBanner';

export default function Home() {
  const { data, local } = useApp();
  const { photos } = usePhotos();
  if (!useReady()) return <Loading />;

  const next = data.events.find((e) => e.type === 'training' || e.replaces_training);
  const specials = data.events.filter((e) => e.type === 'special' && e.id !== next?.id).slice(0, 3);
  const races = data.events.filter((e) => e.type === 'wedstrijd' && (e.km == null || e.km <= 50)).slice(0, 3);

  // Achtergrond van de trainingskaart: uitgelichte foto, anders de eerste clubfoto
  const featured = photos?.find((p) => p.featured);
  const heroImg = featured?.url || null; // zonder uitgelichte foto: het Backyard-filmpje
  const strip = [...(photos || []).slice(0, 8), ...CLUB_PHOTOS.slice(1).map((p, i) => ({ id: 'club-' + i, url: p.src, name: 'BenneKOM', caption: p.caption }))].slice(0, 8);

  return (
    <>
      <ErrorNote />
      <InstallBanner />
      {next && <NextTraining e={next} img={heroImg} />}

      {!data.me && (
        <Link className="panel join-card" href="/profiel">
          <Avatar name="?" size={56} />
          <span style={{ minWidth: 0 }}><b>Maak je profiel</b><br /><span className="small muted">Naam en foto, dan zien anderen wie er komt. Duurt een minuut.</span></span>
          <span className="chev">›</span>
        </Link>
      )}

      <section className="section">
        <div className="section-head"><h2>Doe mee</h2><Link className="link" href="/agenda#special">Alle specials ›</Link></div>
        <div className="list">
          {specials.map((e) => <EventRow key={e.id} e={e} />)}
        </div>
      </section>

      <section className="section">
        <div className="section-head"><h2>Dit zijn wij</h2><Link className="link" href="/fotos">Alle foto&apos;s ›</Link></div>
        <div className="strip">
          <Link className="add" href="/fotos"><b>+</b>Deel je foto</Link>
          {strip.map((p) => (
            <Link key={p.id} href="/fotos" aria-label={p.caption || 'Foto van ' + p.name}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" loading="lazy" />
              <span className="by">{p.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {races.length > 0 && (
        <section className="section">
          <div className="section-head"><h2>Races in de regio</h2><Link className="link" href="/agenda#wedstrijd">Alle wedstrijden ›</Link></div>
          <div className="list">{races.map((e) => <EventRow key={e.id} e={e} noTag />)}</div>
        </section>
      )}

      <section className="section">
        <h2>Handig</h2>
        <div className="tiles">
          <Link className="tile" href="/tools"><span className="k">Calculator</span><span className="v">Tempo, voorspeller, zones, splits</span></Link>
          <Link className="tile" href="/voeding"><span className="k">Voeding</span><span className="v">Je persoonlijke raceplan</span></Link>
          <Link className="tile" href="/leren"><span className="k">Leren</span><span className="v">{local.done.length}/15 modules gelezen</span></Link>
          <Link className="tile" href="/nieuws"><span className="k">Nieuws</span><span className="v">Berichten van de club</span></Link>
          <Link className="tile" href="/partners"><span className="k">Partners</span><span className="v">Ledenkorting bij onze partners</span></Link>
          <Link className="tile" href="/verhaal"><span className="k">Ons verhaal</span><span className="v">Hoe BenneKOM begon</span></Link>
        </div>
      </section>
    </>
  );
}

function NextTraining({ e, img }) {
  const { data, local, act } = useApp();
  const p = dparts(e.date);
  const going = Boolean(data.mine[e.id]);
  const n = data.counts[e.id] || 0;
  return (
    <section className={'hero photo' + (img ? '' : ' has-video')} style={img ? { backgroundImage: `url("${img}")` } : undefined}>
      {!img && (
        <video className="hero-video" src="/media/backyard-montage.mp4" poster="/media/backyard-montage.jpg"
          autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
      )}
      <span className="eyebrow">Volgende clubtraining · {rel(e.date)}</span>
      <h1>{p.W} {p.d} {p.m}</h1>
      <div className="meta"><span className="num">{e.time}</span><span>{e.place}</span></div>
      <div className="count"><span className="n num">{n}</span><span>{n === 1 ? 'loper komt' : 'lopers komen'}</span>
        {n > 0 && <span className="stack">{(data.names[e.id] || []).slice(0, 7).map((p, i) => <Avatar key={i} name={p.name} src={p.avatar} size={30} />)}</span>}
      </div>
      <div className="btn-row">
        <AttendButton e={e} going={going} act={act} local={local} />
        <a className="btn btn-line" href={CLUB.strava} target="_blank" rel="noopener noreferrer">Strava</a>
      </div>
      <span className="slogan">Samen=LEUKER</span>
    </section>
  );
}
