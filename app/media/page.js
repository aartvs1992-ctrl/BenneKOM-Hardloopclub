'use client';
import { useApp } from '@/components/AppProvider';
import { Loading, useReady, PhotoHeader } from '@/components/ui';

const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const when = (v) => (/^\d{4}-\d{2}$/.test(v || '') ? `${MONTHS[+v.slice(5) - 1]} ${v.slice(0, 4)}` : '');

export default function Media() {
  const { data } = useApp();
  if (!useReady()) return <Loading />;
  const items = data.media || [];
  return (
    <>
      <PhotoHeader src="/club/start-runners-world.jpg" title="In de media" sub="BenneKOM in de krant, lokale media en bij partners." pos="center 40%" />
      {items.length ? (
        <div className="media-list">
          {items.map((m) => {
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
      <p className="small muted">Kwam je BenneKOM ergens tegen in de media? Laat het het bestuur weten.</p>
    </>
  );
}
