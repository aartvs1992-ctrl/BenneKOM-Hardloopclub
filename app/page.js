'use client';
import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import { EventRow, Loading, ErrorNote, useReady, AttendButton, AttendWithCheckin, Avatar, People } from '@/components/ui';
import { dparts, rel } from '@/lib/content';
import { CLUB, CLUB_PHOTOS } from '@/lib/club';
import { usePhotos } from '@/lib/usePhotos';
import InstallBanner from '@/components/InstallBanner';
import { workoutFor } from '@/lib/workouts';
import { PROMO, WRAPPED } from '@/lib/content';
import { thumb } from '@/lib/img';

export default function Home() {
  const { data, local } = useApp();
  const { photos } = usePhotos();
  if (!useReady()) return <Loading />;

  const next = data.events.find((e) => e.type === 'training' || e.replaces_training);
  // Eén rustige lijst met wat eraan komt: clubactiviteiten eerst, plus hooguit één race om de hoek
  const firstChallenge = data.events.find((e) => e.type === 'challenge');
  const club = data.events.filter((e) => e.id !== next?.id && (['special', 'samenloop'].includes(e.type) || e === firstChallenge)).slice(0, 3);
  const race = data.events.find((e) => e.type === 'wedstrijd' && (e.featured || (e.km != null && e.km <= 10)));
  const upcoming = [...club, ...(race ? [race] : [])].sort((x, y) => (x.date + (x.time || '')).localeCompare(y.date + (y.time || '')));

  // Achtergrond van de trainingskaart: uitgelichte foto, anders de eerste clubfoto
  const featured = photos?.find((p) => p.featured);
  const heroImg = featured?.url ? thumb(featured.url, 828) : null; // zonder uitgelichte foto: het Backyard-filmpje
  const strip = [...(photos || []).slice(0, 8), ...CLUB_PHOTOS.slice(1).map((p, i) => ({ id: 'club-' + i, url: p.src, name: 'BenneKOM', caption: p.caption }))].slice(0, 8);

  return (
    <>
      <ErrorNote />
      <InstallBanner />
      {next && <NextTraining e={next} img={heroImg} />}

      <KledingNote />
      <WrappedBanner />

      {!data.me && (
        <Link className="panel join-card" href="/profiel">
          <Avatar name="?" size={56} />
          <span style={{ minWidth: 0 }}><b>Meld je aan</b><br /><span className="small muted">Alleen naam en e-mail. Dan krijg je de kortingscodes van onze partners en een seintje over de training.</span></span>
          <span className="chev">›</span>
        </Link>
      )}

      {upcoming.length > 0 && (
        <section className="section">
          <div className="section-head"><h2>Komt eraan</h2><Link className="link" href="/agenda">Hele agenda ›</Link></div>
          <div className="list">{upcoming.map((e) => <EventRow key={e.id} e={e} />)}</div>
        </section>
      )}

      <Link className="panel join-card" href="/agenda#samenloop">
        <span className="physio-ico" aria-hidden="true">+</span>
        <span style={{ minWidth: 0 }}><b>Ook buiten de dinsdag lopen?</b><br /><span className="small muted">Plan een loopje, dan haken clubgenoten aan.</span></span>
        <span className="chev">›</span>
      </Link>

      <section className="section">
        <div className="section-head"><h2>Dit zijn wij</h2><Link className="link" href="/fotos">Alle foto&apos;s ›</Link></div>
        <div className="strip">
          <Link className="add" href="/fotos"><b>+</b>Deel je foto</Link>
          {strip.map((p) => (
            <Link key={p.id} href="/fotos" aria-label={p.caption || 'Foto van ' + p.name}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumb(p.url, 384)} alt="" loading="lazy" />
              <span className="by">{p.name}</span>
            </Link>
          ))}
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
  // Een special die de dinsdagtraining vervangt (bv. de Pasta Run): toon naam en uitleg in de hero
  const special = e.type !== 'training';
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Amsterdam' });
  const promo = PROMO && PROMO.event === e.id;
  const open = promo && today <= PROMO.until;
  return (
    <section className={'hero photo' + (img ? '' : ' has-video')} style={img ? { backgroundImage: `url("${img}")` } : undefined}>
      {!img && (
        <video className="hero-video" src="/media/backyard-montage.mp4" poster="/media/backyard-montage.jpg"
          autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
      )}
      {/* kop (Duurloop/Intervaltraining + datum) is ook tikbaar: opent de trainingspagina */}
      <Link href={'/event/' + e.id} style={{ color: 'inherit', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <span className="eyebrow">{special ? 'Vervangt de clubtraining' : e.title || 'Volgende clubtraining'} · {rel(e.date)}</span>
        <h1>{special ? e.title : `${p.W} ${p.d} ${p.m}`}</h1>
      </Link>
      <div className="meta">{special && <span>{p.W} {p.d} {p.m}</span>}<span className="num">{e.time}</span><span>{e.place}</span></div>
      {special && e.description && <p className="small" style={{ margin: 0, opacity: .9 }}>{e.description}</p>}
      {special && <Link className="hero-wo" href={'/event/' + e.id}>Meer info ›</Link>}
      {promo && (
        <div className="promo-goal">
          <span className="bar"><span style={{ width: `${Math.min(100, (n / PROMO.goal) * 100)}%` }} /></span>
          <span className="small"><b className="num">{n} van {PROMO.goal}</b> {n >= PROMO.goal ? 'aanmeldingen: hij gaat door 🍝' : open ? `· aanmelden t/m ${PROMO.deadline}, bij ${PROMO.goal} gaat hij door` : 'aanmeldingen'}</span>
        </div>
      )}
      {!special && (workoutFor(e.date)
        ? <Link className="hero-wo" href={'/event/' + e.id}><span className="num">{workoutFor(e.date).title}</span> ›</Link>
        : <Link className="hero-wo" href={'/event/' + e.id}>{e.kind === 'duurloop' ? 'Groepjes op elk tempo ›' : 'Meer info ›'}</Link>)}
      {/* tik op de teller of de gezichten: zien wie er komen (ook bij een duurloop zonder workout) */}
      {n > 0 ? (
        <Link className="count" href={'/event/' + e.id} style={{ color: 'inherit', textDecoration: 'none' }} aria-label={`Bekijk wie er komen (${n})`}>
          <span className="n num">{n}</span><span>{n === 1 ? 'loper komt' : 'lopers komen'} ›</span>
          <span className="stack">{(data.names[e.id] || []).slice(0, 7).map((p, i) => <Avatar key={i} name={p.name} src={p.avatar} size={30} />)}</span>
        </Link>
      ) : <div className="count"><span>Wees de eerste die zich aanmeldt</span></div>}
      <div className="btn-row">
        <AttendWithCheckin e={e} going={going} act={act} local={local} />
      </div>
      <span className="slogan">Samen=LEUKER</span>
    </section>
  );
}

// Jaaroverzicht: banner van WRAPPED.from t/m WRAPPED.until (lib/content.js)
function WrappedBanner() {
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Amsterdam' });
  if (today < WRAPPED.from || today > WRAPPED.until) return null;
  return (
    <Link href="/wrapped" className="panel wrapped-banner">
      <span className="w-eb">BenneKOM Wrapped</span>
      <b>Jouw BenneKOM-jaar {WRAPPED.year} staat klaar ✨</b>
      <span className="small">Bekijk je dinsdagen, badges en meer ›</span>
    </Link>
  );
}

// Korte opmerking onder de training: kleding besteld, betalen via de app. Verdwijnt vanzelf na `until`.
const KLEDING = { until: '2026-11-27' };
function KledingNote() {
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Amsterdam' });
  if (today > KLEDING.until) return null;
  return (
    <div className="note" style={{ margin: '4px 0 0', display: 'flex', gap: 10, alignItems: 'center' }}>
      <Link href="/shirt" aria-label="Bekijk het clubshirt" style={{ flex: 'none' }}>
        <img src="/club/shirt-thumb.webp" alt="BenneKOM clubshirt" width={56} height={56} loading="lazy"
          style={{ display: 'block', width: 56, height: 56, objectFit: 'cover', borderRadius: 8, background: '#fff' }} />
      </Link>
      <span>
        <b>Clubkleding:</b> singlets rond 10 december, shirts rond half januari.{' '}
        Betaal je <Link href="/shirt">shirt</Link> of <Link href="/singlet">singlet</Link> via de app.
      </span>
    </div>
  );
}
