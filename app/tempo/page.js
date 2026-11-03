import Link from 'next/link';
import { ZONES } from '@/lib/workouts';
import { PhotoHeader } from '@/components/ui';

export const metadata = { title: "Tempo's · BenneKOM" };

export default function Tempo() {
  return (
    <>
      <PhotoHeader src="/club/samen-tempo.jpg" title="Tempo's" sub="Threshold, VO2max, strides of fartlek? Zo moet het voelen." pos="center 30%" />
      <p>Bij de intervaltrainingen noemen we tempo&apos;s. Hieronder staat per tempo hoe het hoort te voelen. Je eigen snelheden per kilometer reken je uit met de <Link className="link" href="/tools">calculator</Link>.</p>
      <div className="zone-scale" aria-hidden="true">{Object.entries(ZONES).filter(([, z]) => !z.extra).map(([k, z]) => <span key={k} className={'z-' + k} style={{ height: z.level * 20 + '%' }} />)}</div>
      <nav className="zone-nav">{Object.entries(ZONES).map(([k, z]) => <a key={k} href={'#' + k}>{z.short}</a>)}<a href="#noors">Noorse methode</a></nav>
      {Object.entries(ZONES).map(([k, z]) => (
        <section key={k} id={k} className={'panel zone-card z-' + k}>
          <span className="eyebrow">Inspanning {z.rpe}</span>
          <h2>{z.name}</h2>
          <p><b>Zo voelt het:</b> {z.feel}</p>
          <p><b>Waarom:</b> {z.why}</p>
          {z.tip && <p className="wo-note">{z.tip}</p>}
        </section>
      ))}
      <section id="noors" className="panel zone-card z-threshold">
        <span className="eyebrow">Achtergrond</span>
        <h2>De Noorse methode</h2>
        <p>Jakob Ingebrigtsen en zijn broers maakten de Noorse methode beroemd. De kern: heel veel trainen net onder of rond de drempel, en dan juist níet harder. In plaats van één zware training doen ze er vaak twee op een dag (double threshold), elk zo gecontroleerd dat ze de volgende dag gewoon weer kunnen.</p>
        <p>Profs meten dat met een melkzuurmeter. Wij doen het op gevoel: blijf in &quot;comfortabel zwaar&quot;, met korte rustmomenten. Zo bouw je veel kwaliteit op zonder uitgeput te raken. Voor recreanten werkt één zo&apos;n training per week al goed.</p>
        <p className="small"><a className="link" href="https://www.outsideonline.com/health/training-performance/norwegian-method-jakob-ingebrigtsen/" target="_blank" rel="noopener noreferrer">Lees meer over de Noorse methode ↗</a></p>
      </section>
    </>
  );
}
