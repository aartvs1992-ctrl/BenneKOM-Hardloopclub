'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import { Loading } from '@/components/ui';
import { CLUB } from '@/lib/club';

export default function Meer() {
  const { local, updateLocal, toast } = useApp();
  const [ask, setAsk] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (new URLSearchParams(location.search).get('naam')) { setAsk(true); setTimeout(() => ref.current?.focus(), 50); }
  }, []);
  if (!local) return <Loading />;

  return (
    <>
      <h1>Meer</h1>
      <form className="panel" onSubmit={(e) => { e.preventDefault(); toast('Naam opgeslagen'); if (ask) history.back(); }}>
        {ask && <p className="note">Vul eerst je naam in, dan zien andere leden wie er komt.</p>}
        <div className="field"><label htmlFor="me-name">Jouw naam</label>
          <input ref={ref} className="input" id="me-name" value={local.name} onChange={(e) => updateLocal({ name: e.target.value.slice(0, 80) })} placeholder="Zo zien andere leden je" autoComplete="name" /></div>
        {ask && <button className="btn btn-gold" type="submit">Opslaan en terug</button>}
      </form>
      <div className="list">
        {[['/tools', 'Calculator', 'Tempo, voorspeller, zones en splits'], ['/voeding', 'Voeding', 'Raceplan op maat'], ['/leren', 'Leren', local.done.length + '/15 modules'], ['/nieuws', 'Nieuws', 'Berichten van de club'], ['/shirt', 'Clubshirt', 'Singlets, shirts en shorts'], ['/meldingen', 'Meldingen', 'Pushmeldingen instellen']].map(([h, t, s]) => (
          <Link key={h} className="row" style={{ gridTemplateColumns: '1fr auto' }} href={h}><span><span className="t">{t}</span><br /><span className="s">{s}</span></span><span className="chev">›</span></Link>
        ))}
        {[['https://hardloopclubbennekom.nl/verhaal', 'Het verhaal', 'Hoe Bennekom een loopclub kreeg'], [CLUB.strava, 'Strava-club', ''], [CLUB.instagram, 'Instagram', 'Foto\'s en impressies']].map(([h, t, s]) => (
          <a key={h} className="row" style={{ gridTemplateColumns: '1fr auto' }} href={h} target="_blank" rel="noopener noreferrer"><span><span className="t">{t}</span>{s && <><br /><span className="s">{s}</span></>}</span><span className="chev">↗</span></a>
        ))}
      </div>
      <p className="proto">Hardloopclub BenneKOM · sinds 2025 · meedoen is gratis · <Link href="/beheer">Beheer</Link></p>
    </>
  );
}
