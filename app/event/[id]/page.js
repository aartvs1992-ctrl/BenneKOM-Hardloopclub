'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useApp } from '@/components/AppProvider';
import { Loading, ErrorNote, useReady, AttendButton, People, Avatar } from '@/components/ui';
import { dparts, rel, TYPE_LABEL } from '@/lib/content';

export default function EventPage() {
  const { id } = useParams();
  const { data } = useApp();
  if (!useReady()) return <Loading />;
  const e = data.events.find((x) => x.id === id);
  if (!e) return (<><h1>Niet gevonden</h1><p>Dit evenement is voorbij of verwijderd.</p><Link className="link" href="/agenda">Naar de agenda ›</Link></>);

  const p = dparts(e.date);
  const isTraining = e.type === 'training';
  return (
    <>
      <ErrorNote />
      <div className="section">
        <span><span className={'tag ' + e.type}>{TYPE_LABEL[e.type]}</span><span className="eyebrow">{rel(e.date)}</span></span>
        <h1>{e.title}</h1>
        <div className="readout">
          <div><span className="lbl">Datum</span><span className="big" style={{ fontSize: 16 }}>{p.w} {p.d} {p.m}</span></div>
          <div><span className="lbl">Tijd</span><span className="big" style={{ fontSize: 16 }}>{e.time || 'volgt'}</span></div>
          <div><span className="lbl">Plaats</span><span style={{ fontWeight: 600, fontSize: 14 }}>{(e.place || '').split(',')[0]}</span></div>
        </div>
        {e.distances && <p><b>Afstanden:</b> {e.distances}</p>}
        {e.description && <p style={{ whiteSpace: 'pre-line' }}>{e.description}</p>}
        {e.place && <a className="link" href={'https://www.google.com/maps/search/' + encodeURIComponent(e.place)} target="_blank" rel="noopener noreferrer">Open locatie in Maps ›</a>}
      </div>

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
