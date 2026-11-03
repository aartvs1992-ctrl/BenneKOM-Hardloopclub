import Link from 'next/link';
import { ZONES } from '@/lib/workouts';
import { PhotoHeader } from '@/components/ui';

export const metadata = { title: "Tempo's · BenneKOM" };

export default function Tempo() {
  return (
    <>
      <PhotoHeader src="/club/samen-tempo.jpg" title="Tempo's" sub="Rustig, threshold, VO2max, strides of fartlek? Zo moet het voelen." pos="center 30%" />
      <p>Bij de intervaltrainingen noemen we tempo&apos;s. Hieronder staat per tempo hoe het hoort te voelen. Je eigen tempo per kilometer voor elke training reken je uit in de <Link className="link" href="/tools">calculator</Link> (tabblad Trainingstempo): vul een recente wedstrijdtijd in en je ziet je threshold-, VO2max- en rustige tempo.</p>
      <div className="zone-scale" aria-hidden="true">{Object.entries(ZONES).filter(([, z]) => !z.extra && !z.hidden).map(([k, z]) => <span key={k} className={'z-' + k} style={{ height: z.level * 20 + '%' }} />)}</div>
      <nav className="zone-nav">{Object.entries(ZONES).filter(([, z]) => !z.hidden).map(([k, z]) => <a key={k} href={'#' + k}>{z.short}</a>)}</nav>
      {Object.entries(ZONES).filter(([, z]) => !z.hidden).map(([k, z]) => (
        <section key={k} id={k} className={'panel zone-card z-' + k}>
          <span className="eyebrow">Inspanning {z.rpe}</span>
          <h2>{z.name}</h2>
          <p><b>Zo voelt het:</b> {z.feel}</p>
          <p><b>Waarom:</b> {z.why}</p>
          {z.tip && <p className="wo-note">{z.tip}</p>}
          {z.photo && (
            <figure className="zone-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={z.photo.src} alt={z.photo.caption} loading="lazy" />
              <figcaption className="small muted">{z.photo.caption}</figcaption>
            </figure>
          )}
          {z.norway && <p id={k === 'threshold' ? 'noors' : undefined}><b>De Noorse school:</b> {z.norway} <a className="link" href="#vo2max">Over VO2max ›</a></p>}
          {z.norway && <p className="small"><a className="link" href="https://www.outsideonline.com/health/training-performance/norwegian-method-jakob-ingebrigtsen/" target="_blank" rel="noopener noreferrer">Lees meer over de Noorse methode ↗</a></p>}
        </section>
      ))}
    </>
  );
}
