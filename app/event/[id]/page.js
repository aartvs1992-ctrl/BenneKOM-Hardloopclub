'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/components/AppProvider';
import { Loading, ErrorNote, useReady, AttendButton, AttendWithCheckin, People, Avatar } from '@/components/ui';
import Checkin from '@/components/Checkin';
import { dparts, rel, daysTo, TYPE_LABEL } from '@/lib/content';
import { CHALLENGE_EASY } from '@/lib/challenge';
import { Gallery } from '@/components/Gallery';
import PayBox from '@/components/PayBox';
import { Workout } from '@/components/Workout';
import { workoutFor } from '@/lib/workouts';
import { thumb } from '@/lib/img';

const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };

export default function EventPage() {
  const { id } = useParams();
  const { data } = useApp();
  if (!useReady()) return <Loading />;
  const e = data.events.find((x) => x.id === id) || data.past?.find((x) => x.id === id);
  if (!e) return (<><h1>Niet gevonden</h1><p>Dit evenement is voorbij of verwijderd.</p><Link className="link" href="/agenda">Naar de agenda ›</Link></>);

  const p = dparts(e.date);
  const isTraining = e.type === 'training';
  const isRun = e.type === 'samenloop';
  const dt = e.details || {};
  const lines = (t) => String(t || '').split('\n').map((x) => x.trim()).filter(Boolean);
  const program = lines(dt.program).map((l) => { const m = /^(\d{1,2}[:.]\d{2})\s+(.*)$/.exec(l); return m ? [m[1].replace('.', ':'), m[2]] : ['', l]; });
  const bring = lines(dt.bring);
  const routes = (dt.routes || []).filter((r) => r && (r.gpx || r.strava));
  return (
    <>
      <ErrorNote />
      {isRun && !dt.image && (
        <div className="event-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb('/club/groep-lacht.jpg', 828)} alt="" />
        </div>
      )}
      {dt.image && (
        <div className="event-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb(dt.image, 828)} alt="" />
        </div>
      )}
      <div className="section">
        <span><span className={'tag ' + e.type}>{TYPE_LABEL[e.type]}</span><span className="eyebrow">{rel(e.date)}</span></span>
        {e.featured && !e.past && <span className="feat" style={{ marginTop: -6 }}>★ {e.featured}</span>}
        <h1>{e.title}</h1>
        <div className="readout">
          <div><span className="lbl">Datum</span><span className="big" style={{ fontSize: 16 }}>{p.w} {p.d} {p.m}</span></div>
          <div><span className="lbl">Tijd</span><span className="big" style={{ fontSize: 16 }}>{e.time || 'volgt'}</span></div>
          <div><span className="lbl">Plaats</span><span style={{ fontWeight: 600, fontSize: 14 }}>{(e.place || '').split(',')[0]}</span></div>
        </div>
        {isRun ? <p><b>Afstand en tempo:</b> {e.distances} · {dt.pace}</p> : e.distances && <p><b>Afstanden:</b> {e.distances}</p>}
        {isRun && e.organizer && <div className="organizer"><Avatar name={e.organizer.name} src={e.organizer.avatar} size={32} /><span className="small">Georganiseerd door <b>{e.organizer.name}</b></span></div>}
        {isRun && dt.route && <a className="btn btn-line btn-sm" style={{ alignSelf: 'flex-start' }} href={dt.route} target="_blank" rel="noopener noreferrer">Bekijk de route ↗</a>}
        {dt.deadline && !e.past && <Deadline iso={dt.deadline} />}
        {e.type === 'wedstrijd' && e.km != null && <p className="small muted">{e.km < 1 ? 'In Bennekom 🏠' : `${e.km} km van Bennekom (hemelsbreed)`}</p>}
        {e.type === 'wedstrijd' && e.about && (
          <div className="race-about">
            <h3>Over deze wedstrijd</h3>
            <p>{e.about}</p>
          </div>
        )}
        {e.url && (
          <a className="btn btn-gold btn-sm" style={{ alignSelf: 'flex-start' }} href={e.url} target="_blank" rel="noopener noreferrer">
            {e.type === 'wedstrijd' ? (e.regClosed ? 'Website ↗' : 'Website en inschrijven ↗') : 'Info en inschrijven bij de organisatie ↗'}
          </a>
        )}
        {e.type === 'wedstrijd' && e.url && <span className="small muted">{hostOf(e.url)}</span>}
        {e.type === 'wedstrijd' && e.regClosed && !e.past && <p className="small" style={{ margin: 0 }}><b>Inschrijven kan nog niet.</b> Zodra de inschrijving opengaat, vind je die op de site van de organisatie.</p>}
        {e.type === 'wedstrijd' && !e.url && <a className="link" href={'https://www.google.com/search?q=' + encodeURIComponent(e.title + ' ' + e.place + ' ' + e.date.slice(0, 4))} target="_blank" rel="noopener noreferrer">Zoek info en inschrijving ›</a>}
        {e.description && !(e.type === 'wedstrijd' && e.about) && <p className={dt.story ? 'lead' : ''} style={{ whiteSpace: 'pre-line' }}>{e.description}</p>}
        {e.type === 'wedstrijd' && e.about && <p className="small muted">Tijden en inschrijving kunnen veranderen: check altijd de site van de organisatie.</p>}
        {!dt.story && e.place && <a className="link" href={'https://www.google.com/maps/search/' + encodeURIComponent(e.place)} target="_blank" rel="noopener noreferrer">Open locatie in Maps ›</a>}
      </div>

      {dt.story && (
        <section className="section">
          <h2>Wat gaan we doen</h2>
          {dt.story.split(/\n\s*\n/).map((par, i) => <p key={i} style={{ whiteSpace: 'pre-line' }}>{par}</p>)}
        </section>
      )}

      {program.length > 0 && (
        <section className="section">
          <h2>Programma</h2>
          <ol className={'program' + (program.some(([t]) => t) ? '' : ' no-time')}>
            {program.map(([t, x], i) => <li key={i}>{t ? <span className="num">{t}</span> : program.some(([x]) => x) ? <span /> : null}<span>{x}</span></li>)}
          </ol>
        </section>
      )}

      {dt.host && (
        <section className="section">
          <h2>Met</h2>
          <div className="panel host-card">
            {dt.host.photo
              ? /* eslint-disable-next-line @next/next/no-img-element */ <img className="host-photo" src={thumb(dt.host.photo, 256)} alt={dt.host.name} />
              : <Avatar name={dt.host.name} size={84} />}
            <div style={{ minWidth: 0 }}>
              <b className="host-name">{dt.host.name}</b>
              {dt.host.role && <span className="eyebrow">{dt.host.role}</span>}
              {dt.host.bio && <p>{dt.host.bio}</p>}
              {dt.host.url && <a className="link" href={dt.host.url} target="_blank" rel="noopener noreferrer">Website ↗</a>}
            </div>
          </div>
        </section>
      )}

      {e.type === 'challenge' && (
        <div className="panel callout">
          <b>{CHALLENGE_EASY.title}</b>
          <p>{CHALLENGE_EASY.text}</p>
          <Link className="link" href="/challenge">Bekijk jouw 5 km-tijden ›</Link>
        </div>
      )}

      {dt.gallery?.length > 0 && (
        <section className="section">
          <h2>Sfeer</h2>
          <Gallery photos={dt.gallery.map((src) => ({ src }))} />
        </section>
      )}

      {routes.length > 0 && <Routes routes={routes} />}

      {(bring.length > 0 || dt.cost || dt.story) && (
        <section className="section">
          <h2>Praktisch</h2>
          <div className="panel">
            {e.place && <div><span className="plbl">Waar</span><p>{e.place}<br /><a className="link" href={'https://www.google.com/maps/search/' + encodeURIComponent(e.place)} target="_blank" rel="noopener noreferrer">Open in Maps ›</a></p></div>}
            {dt.cost && <div><span className="plbl">Kosten</span><p>{dt.cost}</p></div>}
            {e.capacity && <div><span className="plbl">Plekken</span><p>Maximaal {e.capacity} lopers</p></div>}
            {bring.length > 0 && <div><span className="plbl">Neem mee</span><ul className="bring">{bring.map((b, i) => <li key={i}>{b}</li>)}</ul></div>}
          </div>
        </section>
      )}

      {isTraining && workoutFor(e.date) && <Workout w={workoutFor(e.date)} />}
      {isTraining && !workoutFor(e.date) && e.kind === 'duurloop' && (
        <div className="panel callout">
          <b>Rustig, in groepjes op elk tempo</b>
          <p>We lopen de duurloop rustig, in groepjes op verschillende tempo&apos;s. Er is altijd een groepje dat bij je past, dus iedereen kan aanhaken. Rustig mag hier écht rustig: je moet onderweg hele zinnen kunnen praten.</p>
          <Link className="link" href="/challenge/cooper">Wat is rustig voor jou? Bekijk je tempo&apos;s ›</Link>
        </div>
      )}
      {e.past ? <WasThere e={e} /> : (
        <>
          {(isTraining || isRun) && <Attend e={e} />}
          {e.type === 'wedstrijd' && <RaceAttend e={e} />}
          {isRun && e.own && <CancelRun e={e} />}
          {e.registration && <Register e={e} />}
          {e.carpool && <Carpool e={e} />}
        </>
      )}
    </>
  );
}

// Routes bij een event: GPX downloaden (voor horloge of app) en/of openen in Strava.
function Routes({ routes }) {
  return (
    <section className="section">
      <h2>{routes.length === 1 ? 'De route' : 'De routes'}</h2>
      <div className="routes">
        {routes.map((r, i) => (
          <div className="panel route-card" key={i}>
            <div className="route-head">
              <b className="route-name">{r.label}</b>
              {r.pace && <span className="eyebrow">{r.pace}</span>}
            </div>
            {r.note && <p className="small">{r.note}</p>}
            <div className="route-btns">
              {r.gpx && <a className="btn btn-gold btn-sm" href={r.gpx} download>Download GPX</a>}
              {r.strava && <a className="btn btn-line btn-sm" href={r.strava} target="_blank" rel="noopener noreferrer">Open in Strava ↗</a>}
            </div>
          </div>
        ))}
      </div>
      <p className="note">Zet de GPX vooraf op je horloge, bijvoorbeeld via Garmin Connect of Strava (Routes → Importeren). Zo loop je niet verkeerd als je groepje uit elkaar valt.</p>
    </section>
  );
}

// Afgelopen training of event: terugkijken wie er was
function WasThere({ e }) {
  const { data } = useApp();
  const n = data.counts[e.id] || 0;
  const was = Boolean(data.mine[e.id]);
  return (
    <div className="panel">
      <div className="count"><span className="n num">{n}</span><span>{e.type === 'wedstrijd' ? (n === 1 ? 'BenneKOM\'er deed mee' : 'BenneKOM\'ers deden mee') : n === 1 ? 'loper was erbij' : 'lopers waren erbij'}</span></div>
      {was && <p className="small"><b style={{ color: 'var(--ok)' }}>✓ Jij was erbij</b></p>}
      <People list={data.names[e.id]} />
      <p className="note">Op basis van de aanmeldingen in de app.</p>
      <Link className="link" href={'/agenda#' + (e.type === 'challenge' ? 'special' : e.type) + '-terug'}>Meer terugkijken ›</Link>
    </div>
  );
}

function Attend({ e }) {
  const { data, local, act } = useApp();
  const n = data.counts[e.id] || 0;
  return (
    <div className="panel">
      <div className="count">{n > 0 ? <><span className="n num">{n}</span><span>{n === 1 ? 'loper komt' : 'lopers komen'}</span></> : <span>Wees de eerste die zich aanmeldt</span>}</div>
      <AttendWithCheckin e={e} going={Boolean(data.mine[e.id])} act={act} local={local} long />
      <People list={data.names[e.id]} />
      <p className="note">Zo weten we vooraf hoeveel lopers er komen en zien anderen wie er meeloopt.</p>
    </div>
  );
}

// Wedstrijden: aanvinken dat je meedoet, zodat clubgenoten zien wie er gaat.
function RaceAttend({ e }) {
  const { data, local, act } = useApp();
  const n = data.counts[e.id] || 0;
  const going = Boolean(data.mine[e.id]);
  return (
    <div className="panel">
      <div className="count">{n > 0 ? <><span className="n num">{n}</span><span>{n === 1 ? 'BenneKOM\'er doet mee' : 'BenneKOM\'ers doen mee'}</span></> : <span>Wees de eerste BenneKOM&apos;er die meedoet</span>}</div>
      <button
        className={'btn ' + (going ? 'btn-done' : 'btn-gold')}
        onClick={() => {
          if (!going && !local.name) { location.href = '/profiel?terug=1'; return; }
          act('participate', { eventId: e.id, on: !going }, going ? 'Je staat niet meer op de lijst' : 'Gaaf! Clubgenoten zien dat je meedoet.');
        }}
      >{going ? '✓ Ik doe mee · tik om af te melden' : 'Ik doe mee'}</button>
      <People list={data.names[e.id]} />
      <p className="note">Vink aan als je meedoet. Inschrijven doe je zelf bij de organisatie. Zo zie je wie er nog meer gaat en kun je samen rijden via de carpool.</p>
    </div>
  );
}

function CancelRun({ e }) {
  const { act } = useApp();
  const router = useRouter();
  return (
    <button className="btn btn-line" onClick={async () => {
      if (!confirm('Dit loopje afzeggen? Wie zich heeft aangemeld krijgt een seintje.')) return;
      if (await act('cancelRun', { eventId: e.id }, 'Loopje afgezegd')) router.push('/agenda#samenloop');
    }}>Loopje afzeggen</button>
  );
}

function Register({ e }) {
  const { data, local, updateLocal, act } = useApp();
  const [name, setName] = useState(local.name);
  const mine = data.mine[e.id];
  const my = data.myMeal?.[e.id];
  const opts = e.details?.meals || [];
  const price = Number(e.details?.price || 0);
  const pay = data.myPay?.[e.id];
  const [meal, setMeal] = useState(my?.meal || '');
  const [note, setNote] = useState(my?.note || '');
  const [editing, setEditing] = useState(false);
  const n = data.counts[e.id] || 0;
  const full = e.capacity && n >= e.capacity && !mine;
  const needsMeal = opts.length > 0;
  const askMeal = needsMeal && (!mine || editing || !my);

  const submit = async (nm) => {
    if (needsMeal && !meal) return;
    const ok = await act('participate', { eventId: e.id, on: true, name: nm || mine || local.name, meal, mealNote: note.trim() },
      mine ? 'Je keuze is aangepast' : 'Ingeschreven' + (nm ? ': ' + nm : '!'));
    if (ok) setEditing(false);
  };

  const mealFields = askMeal && (
    <div className="section" style={{ gap: 10 }}>
      <div className="field">
        <span className="plbl">Kies je pasta</span>
        <div className="chips" role="radiogroup" aria-label="Kies je pasta">
          {opts.map((o) => (
            <button key={o} type="button" role="radio" aria-checked={meal === o}
              className={'chip' + (meal === o ? ' on' : '')} onClick={() => setMeal(o)}>{o}</button>
          ))}
        </div>
      </div>
      <div className="field">
        <label htmlFor="reg-note">Opmerking bij je keuze <span className="muted">(optioneel)</span></label>
        <input className="input" id="reg-note" value={note} maxLength={160} onChange={(ev) => setNote(ev.target.value)}
          placeholder={meal ? `Bijv. ${meal.toLowerCase()}, zonder zout` : 'Bijv. zonder zout, glutenvrij, geen noten'} />
      </div>
    </div>
  );

  return (
    <div className="panel">
      <div className="section-head"><h3>Inschrijven</h3><span className="num small muted">{n}{e.capacity ? ' / ' + e.capacity : ''} ingeschreven</span></div>
      <People list={data.names[e.id]} />
      {mine && !askMeal ? (
        <>
          {my && (
            <div className="setrow">
              <span>Jouw keuze: <b>{my.meal}</b>{my.note ? <span className="muted"> · {my.note}</span> : null}</span>
              <button className="btn btn-line btn-sm" onClick={() => { setMeal(my.meal); setNote(my.note); setEditing(true); }}>Wijzigen</button>
            </div>
          )}
          {price > 0 && (
            <div className="section" style={{ gap: 6 }}>
              <span className="plbl">Betalen</span>
              <PayBox amount={price} desc={`${e.title} ${mine}`} paid={pay?.paid} reported={pay?.reported}
                report={{ what: 'event', eventId: e.id }} note="Betaal vooraf via iDEAL, dan is het meteen geregeld." />
            </div>
          )}
          <Checkin e={e} going />
          <button className="btn btn-line" onClick={() => act('participate', { eventId: e.id, on: false }, 'Uitgeschreven')}>Uitschrijven</button>
        </>
      ) : mine ? (
        <>
          {!my && <p className="small"><b>Je staat op de lijst.</b> Geef nog even door welke pasta je wilt.</p>}
          {mealFields}
          <div className="btn-row">
            <button className="btn btn-gold" disabled={!meal} onClick={() => submit()}>Keuze opslaan</button>
            {editing ? <button className="btn btn-line" onClick={() => setEditing(false)}>Annuleren</button>
              : <button className="btn btn-line" onClick={() => act('participate', { eventId: e.id, on: false }, 'Uitgeschreven')}>Uitschrijven</button>}
          </div>
        </>
      ) : full ? <p>Dit evenement zit vol.</p> : data.me ? (
        <>
          {mealFields}
          <button className="btn btn-gold" disabled={needsMeal && !meal} onClick={() => submit()}>
            <Avatar name={data.me.name} src={data.me.avatar} size={26} /> Inschrijven als {data.me.first}
          </button>
          {needsMeal && !meal && <p className="note">Kies eerst je pasta.</p>}
        </>
      ) : (
        <form className="section" onSubmit={async (ev) => {
          ev.preventDefault();
          const nm = name.trim();
          if (!nm || (needsMeal && !meal)) return;
          if (!local.name) updateLocal({ name: nm });
          await submit(nm);
        }}>
          <div className="field"><label htmlFor="reg-name">Jouw naam</label><input className="input" id="reg-name" value={name} onChange={(ev) => setName(ev.target.value)} placeholder="Voornaam en achternaam" autoComplete="name" required /></div>
          {mealFields}
          <button className="btn btn-gold" type="submit" disabled={needsMeal && !meal}>Inschrijven</button>
        </form>
      )}
      <p className="note">{data.me ? 'Je naam en profielfoto zijn zichtbaar voor andere leden.' : <>Geen profiel nodig. Met een <Link href="/profiel">profiel</Link> zien anderen ook je foto.</>}{needsMeal ? ' Je pastakeuze ziet alleen de organisatie.' : ''}</p>
    </div>
  );
}

function Carpool({ e }) {
  const { data, local, act } = useApp();
  const [f, setF] = useState({ from: 'Dunantlaan 18, Bennekom', time: '08:30', seats: 3, open: false });
  const rides = data.rides[e.id] || [];
  const joinedAny = rides.some((r) => r.joined);
  const needName = () => { if (!local.name) { location.href = '/profiel?terug=1'; return true; } return false; };

  return (
    <div className="panel">
      <h3>Carpool</h3>
      <div>
        {rides.length ? rides.map((r) => (
          <div className="ride" key={r.id}>
            <div className="ride-who">
              <Avatar name={r.driver.name} src={r.driver.avatar} size={40} />
              <div>
              <b>{r.driver.name}</b><br />
              <span className="small muted">Vertrek {r.time} · {r.from}</span><br />
              <span className="seats">{r.left} {r.left === 1 ? 'plek' : 'plekken'} vrij</span>
              {r.passengers.length > 0 && <span className="pax">{r.passengers.map((p, i) => <Avatar key={i} name={p.name} src={p.avatar} size={24} />)} <span className="small muted">rijden mee</span></span>}
              </div>
            </div>
            {r.mine ? <button className="btn btn-line btn-sm" onClick={() => act('cancelRide', { rideId: r.id }, 'Rit verwijderd')}>Verwijderen</button>
              : r.joined ? <button className="btn btn-done btn-sm" onClick={() => act('joinRide', { rideId: r.id, on: false }, 'Je rijdt niet meer mee')}>✓ Je rijdt mee</button>
              : r.left > 0 && !joinedAny ? <button className="btn btn-gold btn-sm" onClick={() => !needName() && act('joinRide', { rideId: r.id, on: true }, 'Je rijdt mee. De chauffeur krijgt een melding.')}>Meerijden</button>
              : null}
          </div>
        )) : <p className="muted">Nog geen ritten aangeboden. Rij jij? Bied je plekken hieronder aan.</p>}
      </div>
      {!f.open ? <button className="link" style={{ alignSelf: 'flex-start' }} onClick={() => setF({ ...f, open: true })}>+ Ik rij en heb plek</button> : (
        <form className="section" onSubmit={async (ev) => {
          ev.preventDefault();
          if (needName()) return;
          if (await act('offerRide', { eventId: e.id, from: f.from, time: f.time, seats: f.seats }, 'Rit aangeboden')) setF({ ...f, open: false });
        }}>
          <div className="field"><label htmlFor="cp-from">Vertrekpunt</label><input className="input" id="cp-from" value={f.from} onChange={(ev) => setF({ ...f, from: ev.target.value })} /></div>
          <div className="grid2">
            <div className="field"><label htmlFor="cp-time">Vertrektijd</label><input className="input" id="cp-time" type="time" value={f.time} onChange={(ev) => setF({ ...f, time: ev.target.value })} /></div>
            <div className="field"><label htmlFor="cp-seats">Vrije plekken</label>
              <select className="input" id="cp-seats" value={f.seats} onChange={(ev) => setF({ ...f, seats: +ev.target.value })}>{[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
          </div>
          <button className="btn btn-gold" type="submit">Rit aanbieden</button>
        </form>
      )}
    </div>
  );
}

function Deadline({ iso }) {
  const n = daysTo(iso);
  const p = dparts(iso);
  if (n < 0) return <p className="small muted"><b>Inschrijving gesloten</b> sinds {p.d} {p.m}</p>;
  return <p className={n <= 7 ? 'deadline soon' : 'deadline'}><b>Inschrijven kan tot {p.w} {p.d} {p.m}</b>{n <= 7 && <> · {n === 0 ? 'vandaag de laatste dag' : rel(iso)}</>}</p>;
}
