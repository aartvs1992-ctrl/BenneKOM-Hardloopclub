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
      <Link className="panel join-card physio-card" href="/fysio">
        <span className="physio-ico" aria-hidden="true">+</span>
        <span style={{ minWidth: 0 }}><b>Pijntje of blessure?</b><br /><span className="small muted">Neem contact op met fysiotherapeut {CLUB.physio.name}</span></span>
        <span className="chev">›</span>
      </Link>
      <div className="list">
        {[['/challenge', '5km Challenge', 'Jouw 5 km-tijden, PR en de volgende editie'], ['/partners', 'Partners', 'Korting bij Runners World Ede en Fitsynergy'], ['/tools', 'Calculator', 'Tempo, voorspeller, zones en splits'], ['/tempo', "Tempo's", 'Threshold, VO2max, strides en fartlek'], ['/verhaal', 'Het ontstaan van BenneKOM', 'Hoe Bennekom een loopclub kreeg'], ['/nieuws', 'Nieuws & media', 'Van de club en BenneKOM in de media'], ['/shirt', 'Clubshirt', 'Korte of lange mouw: vink aan wat je wilt'], ['/meldingen', 'Meldingen', 'Pushmeldingen instellen']].map(([h, t, s]) => (
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
