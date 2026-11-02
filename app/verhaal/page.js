'use client';
import Link from 'next/link';
import { PhotoHeader } from '@/components/ui';
import { VERHAAL } from '@/lib/verhaal';

export default function Verhaal() {
  const v = VERHAAL;
  return (
    <>
      <PhotoHeader src="/club/groep-in-de-mist.jpg" title="Het ontstaan" sub={v.intro} pos="center 45%" />
      <article className="article story">
        <span className="eyebrow">Het verhaal · {v.author}</span>
        <h2>{v.title}</h2>
        {v.blocks.length ? v.blocks.map((b, i) => (
          <section key={i} className="story-block">
            {b.heading && <h3>{b.heading}</h3>}
            {b.text && b.text.split('\n\n').map((t, j) => <p key={j}>{t}</p>)}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {b.image && <img src={b.image} alt={b.caption || ''} className="story-img" loading="lazy" />}
            {b.caption && <p className="small muted">{b.caption}</p>}
          </section>
        )) : (
          <p className="note">Het volledige verhaal volgt binnenkort.</p>
        )}
        {v.signoff && <p className="signoff">{v.signoff}</p>}
      </article>
      <section className="section">
        <h2>Tijdlijn</h2>
        <ol className="timeline">
          {v.facts.map(([when, what]) => <li key={when}><b>{when}</b><span>{what}</span></li>)}
        </ol>
      </section>
      <div className="btn-row">
        <Link className="btn btn-gold" href="/agenda">Loop mee op dinsdag</Link>
        <Link className="btn btn-line" href="/media">BenneKOM in de media</Link>
      </div>
    </>
  );
}
