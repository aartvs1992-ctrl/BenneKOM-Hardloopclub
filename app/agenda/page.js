'use client';
import { useState } from 'react';
import { useApp } from '@/components/AppProvider';
import { EventRow, Loading, ErrorNote, useReady } from '@/components/ui';

const FILTERS = [['alles', 'Alles'], ['training', 'Trainingen'], ['special', 'Specials'], ['wedstrijd', 'Wedstrijden'], ['challenge', '5km Challenge']];

export default function Agenda() {
  const { data, act } = useApp();
  const [f, setF] = useState('alles');
  const [open, setOpen] = useState(false);
  const [sg, setSg] = useState({ title: '', date: '', place: '' });
  if (!useReady()) return <Loading />;

  const list = data.events.filter((e) => f === 'alles' || e.type === f);
  return (
    <>
      <h1>Agenda</h1>
      <ErrorNote />
      <div className="chips" role="group" aria-label="Filter">
        {FILTERS.map(([k, l]) => <button key={k} className="chip" aria-pressed={f === k} onClick={() => setF(k)}>{l}</button>)}
      </div>
      {list.length ? <div className="list">{list.map((e) => <EventRow key={e.id} e={e} />)}</div>
        : <p className="panel">Niets gepland in deze categorie.</p>}

      <button className="btn btn-line" onClick={() => setOpen(!open)}>+ Stel een wedstrijd voor</button>
      {open && (
        <form className="panel" onSubmit={async (ev) => {
          ev.preventDefault();
          if (await act('suggest', sg, 'Bedankt! Je voorstel staat bij de organisatie.')) { setOpen(false); setSg({ title: '', date: '', place: '' }); }
        }}>
          <div className="field"><label htmlFor="sg-title">Naam wedstrijd</label><input className="input" id="sg-title" value={sg.title} onChange={(e) => setSg({ ...sg, title: e.target.value })} placeholder="Bijv. Bosloop Ede" /></div>
          <div className="grid2">
            <div className="field"><label htmlFor="sg-date">Datum</label><input className="input" id="sg-date" type="date" value={sg.date} onChange={(e) => setSg({ ...sg, date: e.target.value })} /></div>
            <div className="field"><label htmlFor="sg-place">Plaats</label><input className="input" id="sg-place" value={sg.place} onChange={(e) => setSg({ ...sg, place: e.target.value })} placeholder="Ede" /></div>
          </div>
          <button className="btn btn-gold" type="submit">Voorstel versturen</button>
        </form>
      )}
    </>
  );
}
