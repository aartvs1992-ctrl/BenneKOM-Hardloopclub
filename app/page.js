'use client';
import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import { EventRow, Loading, ErrorNote, useReady, AttendButton, Avatar, People } from '@/components/ui';
import { dparts, rel } from '@/lib/content';
import { CLUB, CLUB_PHOTOS } from '@/lib/club';
import { usePhotos } from '@/lib/usePhotos';
import InstallBanner from '@/components/InstallBanner';
import { workoutFor } from '@/lib/workouts';
import { SINGLET, PROMO } from '@/lib/content';

export default function Home() {
  const { data, local } = useApp();
  const { photos } = usePhotos();
  if (!useReady()) return <Loading />;

  const next = data.events.find((e) => e.type === 'training' || e.replaces_training);
  const specials = data.events.filter((e) => e.type === 'special' && e.id !== next?.id).slice(0, 3);
  const runs = data.events.filter((e) => e.type === 'samenloop').slice(0, 2);
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

      <PromoEvent data={data} />

      <SingletDrop s={data.singlet} />

      <section className="section">
        <div className="section-head"><h2>Ook samen lopen</h2><Link className="link" href="/agenda#samenloop">{runs.length ? 'Alles ›' : 'Plan een loopje ›'}</Link></div>
        {runs.length
          ? <div className="list">{runs.map((e) => <EventRow key={e.id} e={e} noTag />)}</div>
          : (
            <Link className="panel run-invite" href="/agenda#samenloop">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/club/lachen-onderweg.jpg" alt="" loading="lazy" />
              <span><b>Zin om ook buiten de dinsdag te lopen?</b><br /><span className="small muted">Plan een loopje met afstand en tempo, dan haken clubgenoten aan.</span></span>
            </Link>
          )}
      </section>

      {!data.me && (
        <Link className="panel join-card" href="/profiel">
          <Avatar name="?" size={56} />
          <span style={{ minWidth: 0 }}><b>Meld je aan</b><br /><span className="small muted">Alleen naam en e-mail. Dan krijg je de kortingscodes van onze partners en een seintje over de training.</span></span>
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
        <h2>Meer BenneKOM</h2>
        <div className="tiles">
          <Link className="tile" href="/verhaal"><span className="k">Ons verhaal</span><span className="v">Hoe BenneKOM begon</span></Link>
          <Link className="tile" href="/partners"><span className="k">Partners</span><span className="v">Ledenkorting bij onze partners</span></Link>
          <Link className="tile" href="/nieuws"><span className="k">Nieuws & media</span><span className="v">Van de club en in de media</span></Link>
          <Link className="tile" href="/fysio"><span className="k">Blessure?</span><span className="v">Fysiotherapeut David Hemstede</span></Link>
          <Link className="tile tile-wide" href="/tools"><span className="k">Training &amp; tempo</span><span className="v">Jouw tempo&apos;s, uitleg, voorspeller en splits</span></Link>
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
      <span className="eyebrow">{e.kind === 'interval' ? 'Intervaltraining' : e.kind === 'duurloop' ? 'Duurloop' : 'Volgende clubtraining'} · {rel(e.date)}</span>
      <h1>{p.W} {p.d} {p.m}</h1>
      <div className="meta"><span className="num">{e.time}</span><span>{e.place}</span></div>
      {workoutFor(e.date) && <Link className="hero-wo" href={'/event/' + e.id}><span className="num">{workoutFor(e.date).title}</span> ›</Link>}
      <div className="count">{n > 0 ? <><span className="n num">{n}</span><span>{n === 1 ? 'loper komt' : 'lopers komen'}</span></> : <span>Wees de eerste die zich aanmeldt</span>}
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

// Aankondiging race singlet: zichtbaar zolang er voorraad is, of als je er zelf een hebt geclaimd
function SingletDrop({ s }) {
  if (!s?.ready) return null;
  const total = Object.values(SINGLET.stock).reduce((a, b) => a + b, 0);
  const rest = Object.values(s.left || {}).reduce((a, b) => a + b, 0);
  if (s.mine?.status === 'betaald' || (!s.mine && rest === 0)) return null;
  return (
    <Link className="panel singlet-drop" href="/singlet">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/club/singlet-thumb.jpg" alt="" />
      <span style={{ minWidth: 0 }}>
        <span className="tag">{s.mine ? 'Jouw singlet' : 'Nieuw · eerste batch'}</span>
        <b>BenneKOM race singlet</b>
        <span className="small muted">{s.mine
          ? `Geclaimd in maat ${s.mine.size}. Je hoort wanneer hij binnen is.`
          : `Gelaserde naden, onder de 100 gram. Nog ${rest} van de ${total}: claim de jouwe.`}</span>
        {!s.mine && <span className="bar"><span style={{ width: `${(rest / total) * 100}%` }} /></span>}
      </span>
      <span className="chev">›</span>
    </Link>
  );
}

// Promotie van een evenement met een minimum aantal deelnemers (zie PROMO in lib/content.js)
function PromoEvent({ data }) {
  const { act } = useApp();
  if (!PROMO) return null;
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Amsterdam' });
  const e = data.events.find((x) => x.id === PROMO.event);
  if (!e || today > PROMO.until) return null;
  const n = data.counts[e.id] || 0;
  const going = !!data.mine[e.id];
  const short = Math.max(0, PROMO.goal - n);
  const d = new Date(e.date + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <section className="panel promo">
      <span className="tag">{short ? `Doe je mee? Aanmelden t/m ${PROMO.deadline}` : 'Hij gaat door!'}</span>
      <Link href={`/event/${e.id}`} className="promo-title"><b>{e.title}</b><span className="small muted">{d} · {e.time}</span></Link>
      <p className="small" style={{ margin: 0 }}>{e.description}{e.details?.cost ? ' ' + e.details.cost.split('.')[0] + '.' : ''}</p>
      <div className="promo-goal">
        <span className="bar"><span style={{ width: `${Math.min(100, (n / PROMO.goal) * 100)}%` }} /></span>
        <span className="small"><b>{n} van {PROMO.goal}</b> {short ? `· bij ${PROMO.goal} aanmeldingen gaat hij door` : 'aanmeldingen 🍝'}</span>
      </div>
      {(data.names[e.id] || []).length > 0 && <span className="stack">{data.names[e.id].slice(0, 10).map((p, i) => <Avatar key={i} name={p.name} src={p.avatar} size={28} />)}</span>}
      {going ? (
        <span className="small"><b>✓ Jij bent erbij.</b> {short ? `Nog ${short} nodig: neem een clubgenoot mee!` : 'Tot dinsdag!'}</span>
      ) : (
        <div className="promo-actions">
          <button className="btn btn-gold" onClick={() => act('participate', { eventId: e.id, on: true }, 'Gaaf, je bent erbij!')}>Ik ben erbij</button>
          <Link className="btn btn-line" href={`/event/${e.id}`}>Meer info</Link>
        </div>
      )}
    </section>
  );
}
