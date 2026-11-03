'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useApp } from '@/components/AppProvider';
import { Loading, ErrorNote, useReady, AttendButton, People, Avatar } from '@/components/ui';
import { dparts, rel, TYPE_LABEL } from '@/lib/content';
import { CHALLENGE_EASY } from '@/lib/challenge';
import { Gallery } from '@/components/Gallery';
import { Workout } from '@/components/Workout';
import { workoutFor } from '@/lib/workouts';

export default function EventPage() {
  const { id } = useParams();
  const { data } = useApp();
  if (!useReady()) return <Loading />;
  const e = data.events.find((x) => x.id === id);
  if (!e) return (<><h1>Niet gevonden</h1><p>Dit evenement is voorbij of verwijderd.</p><Link className="link" href="/agenda">Naar de agenda ›</Link></>);

  const p = dparts(e.date);
  const isTraining = e.type === 'training';
  const dt = e.details || {};
  const lines = (t) => String(t || '').split('\n').map((x) => x.trim()).filter(Boolean);
  const program = lines(dt.program).map((l) => { const m = /^(\d{1,2}[:.]\d{2})\s+(.*)$/.exec(l); return m ? [m[1].replace('.', ':'), m[2]] : ['', l]; });
  const bring = lines(dt.bring);
  return (
    <>
      <ErrorNote />
      {dt.image && (
        <div className="event-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dt.image} alt="" />
        </div>
      )}
      <div className="section">
        <span><span className={'tag ' + e.type}>{TYPE_LABEL[e.type]}</span><span className="eyebrow">{rel(e.date)}</span></span>
        <h1>{e.title}</h1>
        <div className="readout">
          <div><span className="lbl">Datum</span><span className="big" style={{ fontSize: 16 }}>{p.w} {p.d} {p.m}</span></div>
          <div><span className="lbl">Tijd</span><span className="big" style={{ fontSize: 16 }}>{e.time || 'volgt'}</span></div>
          <div><span className="lbl">Plaats</span><span style={{ fontWeight: 600, fontSize: 14 }}>{(e.place || '').split(',')[0]}</span></div>
        </div>
        {e.distances && <p><b>Afstanden:</b> {e.distances}</p>}
        {e.type === 'wedstrijd' && e.km != null && <p className="small muted">{e.km} km van Bennekom (hemelsbreed)</p>}
        {e.url && <a className="btn btn-line btn-sm" style={{ alignSelf: 'flex-start' }} href={e.url} target="_blank" rel="noopener noreferrer">Info en inschrijven bij de organisatie ↗</a>}
        {e.type === 'wedstrijd' && !e.url && <a className="link" href={'https://www.google.com/search?q=' + encodeURIComponent(e.title + ' ' + e.place + ' ' + e.date.slice(0, 4))} target="_blank" rel="noopener noreferrer">Zoek info en inschrijving ›</a>}
        {e.description && <p className={dt.story ? 'lead' : ''} style={{ whiteSpace: 'pre-line' }}>{e.description}</p>}
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
              ? /* eslint-disable-next-line @next/next/no-img-element */ <img className="host-photo" src={dt.host.photo} alt={dt.host.name} />
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
      {isTraining && <Attend e={e} />}
      {e.registration && <Register e={e} />}
      {e.carpool && <Carpool e={e} />}
    </>
  );
}

function Attend({ e }) {
  const { data, local, act } = useApp();
  const n = data.counts[e.id] || 0;
  return (
    <div className="panel">
      <div className="count"><span className="n num">{n}</span><span>{n === 1 ? 'loper komt' : 'lopers komen'}</span></div>
      <AttendButton e={e} going={Boolean(data.mine[e.id])} act={act} local={local} long />
      <People list={data.names[e.id]} />
      <p className="note">Zo weet de trainer vooraf hoeveel mensen er komen en kan hij de groepen indelen.</p>
    </div>
  );
}

function Register({ e }) {
  const { data, local, updateLocal, act } = useApp();
  const [name, setName] = useState(local.name);
  const mine = data.mine[e.id];
  const n = data.counts[e.id] || 0;
  const full = e.capacity && n >= e.capacity && !mine;
  return (
    <div className="panel">
      <div className="section-head"><h3>Inschrijven</h3><span className="num small muted">{n}{e.capacity ? ' / ' + e.capacity : ''} ingeschreven</span></div>
      <People list={data.names[e.id]} />
      {mine ? (
        <button className="btn btn-line" onClick={() => act('participate', { eventId: e.id, on: false }, 'Uitgeschreven')}>Uitschrijven</button>
      ) : full ? <p>Dit evenement zit vol.</p> : data.me ? (
        <button className="btn btn-gold" onClick={() => act('participate', { eventId: e.id, on: true }, 'Ingeschreven!')}>
          <Avatar name={data.me.name} src={data.me.avatar} size={26} /> Inschrijven als {data.me.first}
        </button>
      ) : (
        <form className="section" onSubmit={async (ev) => {
          ev.preventDefault();
          const nm = name.trim();
          if (!nm) return;
          if (!local.name) updateLocal({ name: nm });
          await act('participate', { eventId: e.id, on: true, name: nm }, 'Ingeschreven: ' + nm);
        }}>
          <div className="field"><label htmlFor="reg-name">Jouw naam</label><input className="input" id="reg-name" value={name} onChange={(ev) => setName(ev.target.value)} placeholder="Voornaam en achternaam" autoComplete="name" required /></div>
          <button className="btn btn-gold" type="submit">Inschrijven</button>
        </form>
      )}
      <p className="note">{data.me ? 'Je naam en profielfoto zijn zichtbaar voor andere leden.' : <>Geen profiel nodig. Met een <Link href="/profiel">profiel</Link> zien anderen ook je foto.</>}</p>
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
