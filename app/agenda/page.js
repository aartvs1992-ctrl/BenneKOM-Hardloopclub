'use client';
import { useEffect, useState } from 'react';
import { useApp } from '@/components/AppProvider';
import { EventRow, Loading, ErrorNote, useReady, PhotoHeader } from '@/components/ui';

const TABS = [
  ['training', 'Trainingen', 'Elke dinsdag samen lopen, alle niveaus.'],
  ['special', 'Specials', 'Clubactiviteiten en de maandelijkse 5km Challenge.'],
  ['wedstrijd', 'Wedstrijden', 'Races binnen 50 km van Bennekom. De club gaat samen: regel je rit via de carpool.'],
];
const MONTH = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

export default function Agenda() {
  const { data, act } = useApp();
  const [tab, setTab] = useState('training');
  const [open, setOpen] = useState(false);
  const [sg, setSg] = useState({ title: '', date: '', place: '' });
  useEffect(() => {
    const fromHash = () => { const h = location.hash.slice(1); if (TABS.some(([k]) => k === h)) setTab(h); };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);
  if (!useReady()) return <Loading />;

  const inTab = (e) => (tab === 'special' ? e.type === 'special' || e.type === 'challenge' : e.type === tab);
  const list = data.events.filter(inTab).filter((e) => tab !== 'wedstrijd' || e.km == null || e.km <= 50);
  const count = (k) => data.events.filter((e) => (k === 'special' ? e.type === 'special' || e.type === 'challenge' : e.type === k)).length;
  // per maand groeperen
  const groups = [];
  for (const e of list) {
    const key = e.date.slice(0, 7);
    if (!groups.length || groups[groups.length - 1].key !== key) groups.push({ key, items: [] });
    groups[groups.length - 1].items.push(e);
  }
  const [, , intro] = TABS.find(([k]) => k === tab);

  return (
    <>
      <PhotoHeader src="/club/herfstlaan.jpg" title="Agenda" sub="Trainingen, specials en wedstrijden. Iedereen is welkom." pos="center 68%" />
      <ErrorNote />
      <div className="seg agenda-tabs" role="tablist" aria-label="Soort">
        {TABS.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} aria-pressed={tab === k} onClick={() => { setTab(k); history.replaceState(null, '', '#' + k); }}>
            {l} <span className="cnt">{count(k)}</span>
          </button>
        ))}
      </div>
      <p className="muted small">{intro}</p>
      {groups.length ? groups.map((g) => (
        <section key={g.key} className="section">
          <h3 className="month">{MONTH[+g.key.slice(5) - 1]} {g.key.slice(0, 4)}</h3>
          <div className="list">{g.items.map((e) => <EventRow key={e.id} e={e} noTag={tab !== 'special'} />)}</div>
        </section>
      )) : <p className="panel">Niets gepland in deze categorie.</p>}

      {tab === 'wedstrijd' && <p className="small muted">Bron: hardloopkalenders van Nederland. Controleer datum en inschrijven altijd bij de organisatie.</p>}
      {tab === 'wedstrijd' && <button className="btn btn-line" onClick={() => setOpen(!open)}>+ Mis je een wedstrijd? Stel hem voor</button>}
      {open && tab === 'wedstrijd' && (
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
