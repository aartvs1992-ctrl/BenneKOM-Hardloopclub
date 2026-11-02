'use client';
import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import { Loading, PhotoHeader, Avatar } from '@/components/ui';
import { CLUB } from '@/lib/club';

export default function Meer() {
  const { local, data } = useApp();
  if (!local) return <Loading />;

  return (
    <>
      <PhotoHeader src="/club/karikaturenwand.jpg" title="Meer" sub="Hardloopclub BenneKOM · sinds 2025 · iedereen welkom" pos="center 30%" />
      <Link className="panel join-card" href="/profiel">
        <Avatar name={data?.me?.name || local.name || '?'} src={data?.me?.avatar} size={56} />
        <span style={{ minWidth: 0 }}><b>{data?.me ? data.me.name : 'Maak je profiel'}</b><br /><span className="small muted">{data?.me ? 'Mijn profiel: naam, foto en code voor een ander toestel' : 'Naam en foto, dan zien anderen wie er komt'}</span></span>
        <span className="chev">›</span>
      </Link>
      <div className="list">
        {[['/partners', 'Partners', 'Korting bij Runners World Ede en Fitsynergy'], ['/tools', 'Calculator', 'Tempo, voorspeller, zones en splits'], ['/voeding', 'Voeding', 'Raceplan op maat'], ['/leren', 'Leren', local.done.length + '/15 modules'], ['/nieuws', 'Nieuws', 'Berichten van de club'], ['/verhaal', 'Het ontstaan van BenneKOM', 'Hoe Bennekom een loopclub kreeg'], ['/media', 'BenneKOM in de media', 'Krant, lokale media en partners'], ['/shirt', 'Clubshirt', 'Singlets, shirts en shorts'], ['/meldingen', 'Meldingen', 'Pushmeldingen instellen']].map(([h, t, s]) => (
          <Link key={h} className="row" style={{ gridTemplateColumns: '1fr auto' }} href={h}><span><span className="t">{t}</span><br /><span className="s">{s}</span></span><span className="chev">›</span></Link>
        ))}
        {[[CLUB.strava, 'Strava-club', ''], [CLUB.instagram, 'Instagram', 'Foto\'s en impressies']].map(([h, t, s]) => (
          <a key={h} className="row" style={{ gridTemplateColumns: '1fr auto' }} href={h} target="_blank" rel="noopener noreferrer"><span><span className="t">{t}</span>{s && <><br /><span className="s">{s}</span></>}</span><span className="chev">↗</span></a>
        ))}
      </div>
      <p className="proto">Hardloopclub BenneKOM · sinds 2025 · meedoen is gratis · <Link href="/beheer">Beheer</Link></p>
    </>
  );
}
