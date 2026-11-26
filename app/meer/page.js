'use client';
import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import { Loading, PhotoHeader, Avatar } from '@/components/ui';
import { CLUB } from '@/lib/club';

// Het menu, in groepjes zodat leden sneller vinden wat ze zoeken
const GROUPS = [
  ['Mijn BenneKOM', [
    ['/badges', 'Mijn badges', 'Verdien badges met trainingen, Challenges en events'],
    ['/challenge', 'Challenges', 'Jouw 5 km-tijden en je coopertest met tempo\'s'],
    ['/tools', 'Training & tempo', "Jouw tempo's, uitleg, voorspeller en splits"],
    ['/berichten', 'Berichten', 'Stuur clubgenoten een bericht'],
    ['/meldingen', 'Meldingen', 'Pushmeldingen instellen'],
  ]],
  ['Club', [
    ['/leden', 'Clubgenoten', 'Bekijk profielen, antwoorden en badges van andere lopers'],
    ['/nieuws', 'Nieuws & media', 'Van de club en BenneKOM in de media'],
    ['/partners', 'Partners', 'Korting bij Runners World Ede, Fitsynergy en Thrive'],
    ['/verhaal', 'Het ontstaan van BenneKOM', 'Hoe Bennekom een loopclub kreeg'],
  ]],
  ['Clubkleding', [
    ['/shirt', 'Clubshirt', 'Besteld · levering rond de derde week van januari'],
    ['/singlet', 'Race singlet', 'Beperkte oplage: claim de jouwe'],
  ]],
  ['Volg ons', [
    [CLUB.strava, 'Strava-club', ''],
    [CLUB.instagram, 'Instagram', 'Foto\'s en impressies'],
  ]],
];

export default function Meer() {
  const { local, data } = useApp();
  if (!local) return <Loading />;

  return (
    <>
      <PhotoHeader src="/club/karikaturenwand.jpg" title="Meer" sub="Hardloopclub BenneKOM · sinds 2025 · iedereen welkom" pos="center 30%" />
      <Link className="panel join-card" href="/profiel">
        <Avatar name={data?.me?.name || local.name || '?'} src={data?.me?.avatar} size={56} />
        <span style={{ minWidth: 0 }}><b>{data?.me ? data.me.name : 'Meld je aan'}</b><br /><span className="small muted">{data?.me ? 'Mijn profiel: naam, foto en code voor een ander toestel' : 'Naam en e-mail, dan krijg je de kortingscodes van onze partners'}</span></span>
        <span className="chev">›</span>
      </Link>
      <Link className="panel join-card physio-card" href="/fysio">
        <span className="physio-ico" aria-hidden="true">+</span>
        <span style={{ minWidth: 0 }}><b>Pijntje of blessure?</b><br /><span className="small muted">Neem contact op met fysiotherapeut {CLUB.physio.name}</span></span>
        <span className="chev">›</span>
      </Link>
      {GROUPS.map(([kop, items]) => (
        <section className="section" key={kop}>
          <h2>{kop}</h2>
          <div className="list">
            {items.map(([h, t, sub]) => {
              const ext = h.startsWith('http');
              const inner = <><span><span className="t">{t}</span>{sub && <><br /><span className="s">{sub}</span></>}</span><span className="chev">{ext ? '↗' : '›'}</span></>;
              return ext
                ? <a key={h} className="row" style={{ gridTemplateColumns: '1fr auto' }} href={h} target="_blank" rel="noopener noreferrer">{inner}</a>
                : <Link key={h} className="row" style={{ gridTemplateColumns: '1fr auto' }} href={h}>{inner}</Link>;
            })}
          </div>
        </section>
      ))}
      <p className="proto">Hardloopclub BenneKOM · sinds 2025 · meedoen is gratis · <Link href="/beheer">Beheer</Link></p>
    </>
  );
}
