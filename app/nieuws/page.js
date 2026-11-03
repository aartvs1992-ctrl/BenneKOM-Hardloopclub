'use client';
import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import { Loading, ErrorNote, useReady, PhotoHeader } from '@/components/ui';
import { MON } from '@/lib/content';
import { CLUB } from '@/lib/club';

const date = (iso) => { const d = new Date(String(iso).slice(0, 10) + 'T12:00:00'); return isNaN(d) ? '' : `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`; };
const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const when = (v) => (/^\d{4}-\d{2}$/.test(v || '') ? `${MONTHS[+v.slice(5) - 1]} ${v.slice(0, 4)}` : '');

export default function Nieuws() {
  const { data } = useApp();
  if (!useReady()) return <Loading />;
  const news = data.news || [];
  const media = data.media || [];

  return (
    <>
      <PhotoHeader src="/club/start-runners-world.jpg" title="Nieuws & media" sub="Wat er speelt bij de club, en BenneKOM in de media." pos="center 40%" />
      <ErrorNote />

      <section className="section">
        <h2>Van de club</h2>
        {news.length ? news.map((n) => (
          <article key={n.id} className="panel news-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {n.image && <img src={n.image} alt="" loading="lazy" />}
            <div className="news-body">
              <span className="eyebrow">{n.author}{date(n.published_at) && ' · ' + date(n.published_at)}</span>
              <h3>{n.title}</h3>
              {n.body && <p>{n.body}</p>}
              <span className="btn-row" style={{ gap: 14 }}>
                {n.url && <a className="link" href={n.url} target="_blank" rel="noopener noreferrer">Bekijk op Strava ↗</a>}
                {n.event_id && <Link className="link" href={'/event/' + n.event_id}>Naar het evenement ›</Link>}
              </span>
            </div>
          </article>
        )) : <p className="panel muted">Nog geen berichten. Volg de club ondertussen op Strava.</p>}
        <a className="link" href={CLUB.strava} target="_blank" rel="noopener noreferrer">Alle posts van de club op Strava ↗</a>
      </section>

      <section className="section" id="media">
        <h2>In de media</h2>
        {media.length ? (
          <div className="media-list">
            {media.map((m) => {
              const Tag = m.url ? 'a' : 'div';
              return (
                <Tag key={m.id} className="panel media-item" {...(m.url ? { href: m.url, target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  <span className="eyebrow">{m.outlet}{when(m.published) ? ' · ' + when(m.published) : ''}</span>
                  <h3>{m.title}</h3>
                  {m.summary && <p className="small">{m.summary}</p>}
                  {m.url && <span className="link">Lees het artikel ↗</span>}
                </Tag>
              );
            })}
          </div>
        ) : <p className="panel muted">Nog geen artikelen.</p>}
        <p className="small muted">Kwam je BenneKOM ergens tegen in de media? Laat het weten.</p>
      </section>
    </>
  );
}
