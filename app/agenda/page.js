'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import { EventRow, Loading, ErrorNote, useReady, PhotoHeader } from '@/components/ui';

const TABS = [
  ['training', 'Trainingen', 'Elke dinsdag samen lopen, alle niveaus.'],
  ['special', 'Specials', 'Clubactiviteiten en de maandelijkse 5km Challenge.'],
  ['wedstrijd', 'Wedstrijden', 'Races binnen 50 km van Bennekom. De club gaat samen: regel je rit via de carpool.'],
  ['samenloop', 'Samen lopen', 'Loopjes van leden buiten de dinsdag. Haak aan of plan er zelf een.'],
];
const EMPTY_RUN = { title: '', date: '', time: '09:00', place: 'Dunantlaan 18, Bennekom', km: '', pace: '', route: '', note: '' };
const MONTH = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

export default function Agenda() {
  const { data, act } = useApp();
  const [tab, setTab] = useState('training');
  const [open, setOpen] = useState(false);
  const [sg, setSg] = useState({ title: '', date: '', place: '' });
  const [plan, setPlan] = useState(false);
  const [run, setRun] = useState(EMPTY_RUN);
  const [back, setBack] = useState(false); // terugkijken: afgelopen trainingen en events
  useEffect(() => {
    const fromHash = () => {
      const [h, w] = location.hash.slice(1).split('-');
      if (TABS.some(([k]) => k === h)) setTab(h);
      setBack(w === 'terug');
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);
  if (!useReady()) return <Loading />;

  const inTab = (e) => (tab === 'special' ? e.type === 'special' || e.type === 'challenge' : e.type === tab);
  const list = back
    ? (data.past || []).filter(inTab)
    : data.events.filter(inTab).filter((e) => tab !== 'wedstrijd' || e.km == null || e.km <= 50);
  const setHash = (t, b) => history.replaceState(null, '', '#' + t + (b ? '-terug' : ''));
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
      {tab === 'samenloop'
        ? <PhotoHeader src="/club/groep-lacht.jpg" title="Samen lopen" sub="Ook buiten de dinsdag samen op pad. Plan een loopje of haak aan." pos="center 45%" />
        : <PhotoHeader src="/club/herfstlaan.jpg" title="Agenda" sub="Trainingen, specials en wedstrijden. Iedereen is welkom." pos="center 68%" />}
      <ErrorNote />
      <div className="seg agenda-tabs" role="tablist" aria-label="Soort">
        {TABS.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} aria-pressed={tab === k} onClick={() => { setTab(k); setHash(k, back); }}>
            {l} <span className="cnt">{count(k)}</span>
          </button>
        ))}
      </div>
      <div className="seg when-toggle" aria-label="Periode">
        <button aria-pressed={!back} onClick={() => { setBack(false); setHash(tab, false); }}>Komend</button>
        <button aria-pressed={back} onClick={() => { setBack(true); setHash(tab, true); }}>Terugkijken</button>
      </div>
      <p className="muted small">{back ? 'Kijk terug wie er bij de afgelopen keren was.' : intro}</p>
      {!back && tab === 'samenloop' && (data.me
        ? <button className="btn btn-gold" onClick={() => setPlan(!plan)} aria-expanded={plan}>{plan ? 'Sluiten' : '+ Loop plannen'}</button>
        : <Link className="panel muted small" href="/profiel">Meld je aan om zelf een loopje te plannen ›</Link>)}
      {!back && tab === 'samenloop' && plan && (
        <form className="panel" onSubmit={async (ev) => {
          ev.preventDefault();
          if (await act('planRun', { run }, 'Je loopje staat in de agenda')) { setPlan(false); setRun(EMPTY_RUN); }
        }}>
          <div className="grid2">
            <div className="field"><label htmlFor="rn-date">Dag</label><input className="input" id="rn-date" type="date" required value={run.date} onChange={(e) => setRun({ ...run, date: e.target.value })} /></div>
            <div className="field"><label htmlFor="rn-time">Tijd</label><input className="input" id="rn-time" type="time" required value={run.time} onChange={(e) => setRun({ ...run, time: e.target.value })} /></div>
          </div>
          <div className="field"><label htmlFor="rn-place">Startpunt</label><input className="input" id="rn-place" required value={run.place} onChange={(e) => setRun({ ...run, place: e.target.value })} /></div>
          <div className="grid2">
            <div className="field"><label htmlFor="rn-km">Afstand (km)</label><input className="input num" id="rn-km" inputMode="decimal" required value={run.km} onChange={(e) => setRun({ ...run, km: e.target.value })} placeholder="15" /></div>
            <div className="field"><label htmlFor="rn-pace">Tempo</label><input className="input num" id="rn-pace" list="rn-paces" required value={run.pace} onChange={(e) => setRun({ ...run, pace: e.target.value })} placeholder="5:30" /></div>
          </div>
          <datalist id="rn-paces"><option value="praattempo" /><option value="rustig" /></datalist>
          <div className="field"><label htmlFor="rn-title">Naam van het loopje (optioneel)</label><input className="input" id="rn-title" value={run.title} onChange={(e) => setRun({ ...run, title: e.target.value })} placeholder="Rondje Ginkelse Heide" /></div>
          <div className="field"><label htmlFor="rn-route">Route (optioneel)</label><input className="input" id="rn-route" type="url" value={run.route} onChange={(e) => setRun({ ...run, route: e.target.value })} placeholder="Link naar Strava- of Komoot-route" /></div>
          <div className="field"><label htmlFor="rn-note">Toelichting (optioneel)</label><textarea className="input" id="rn-note" rows="2" value={run.note} onChange={(e) => setRun({ ...run, note: e.target.value })} placeholder="Over de heide, koffie na afloop" /></div>
          <button className="btn btn-gold" type="submit">Plaatsen</button>
        </form>
      )}
      {groups.length ? groups.map((g) => (
        <section key={g.key} className="section">
          <h3 className="month">{MONTH[+g.key.slice(5) - 1]} {g.key.slice(0, 4)}</h3>
          <div className="list">{g.items.map((e) => <EventRow key={e.id} e={e} noTag={tab !== 'special'} />)}</div>
        </section>
      )) : <p className="panel">{back ? 'Hier verschijnen afgelopen keren zodra er lopers aangemeld waren.' : tab === 'samenloop' ? 'Nog geen loopjes gepland. Zin om zondag samen te lopen? Plan de eerste!' : 'Niets gepland in deze categorie.'}</p>}

      {!back && tab === 'wedstrijd' && <p className="small muted">Bron: hardloopkalenders van Nederland. Controleer datum en inschrijven altijd bij de organisatie.</p>}
      {!back && tab === 'wedstrijd' && <button className="btn btn-line" onClick={() => setOpen(!open)}>+ Mis je een wedstrijd? Stel hem voor</button>}
      {!back && open && tab === 'wedstrijd' && (
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
