'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import { Loading, useReady, PhotoHeader } from '@/components/ui';

export default function Partners() {
  const { data } = useApp();
  if (!useReady()) return <Loading />;
  const list = data.partners || [];
  return (
    <>
      <PhotoHeader src="/club/door-de-boog.jpg" title="Partners" sub="Voordeel voor BenneKOM-leden bij onze partners." pos="center 40%" />
      {list.length ? list.map((p) => <PartnerCard key={p.id} p={p} />) : <p className="panel muted">Nog geen partners.</p>}
    </>
  );
}

function PartnerCard({ p }) {
  const { toast } = useApp();
  const [copied, setCopied] = useState(false);
  async function copy(e) {
    try { await navigator.clipboard.writeText(p.code); setCopied(true); toast('Code gekopieerd'); setTimeout(() => setCopied(false), 2000); }
    catch { const r = document.createRange(); r.selectNodeContents(e.currentTarget.previousSibling); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
  }
  return (
    <section className="panel partner">
      <h2>{p.name}</h2>
      {p.about && <p>{p.about}</p>}
      {p.benefit && <p className="benefit">{p.benefit}</p>}
      {p.code ? (
        <div className="code-box">
          <span className="eyebrow">Kortingscode</span>
          <div className="code-row"><span className="code num">{p.code}</span><button className="btn btn-gold btn-sm" onClick={copy}>{copied ? '✓ Gekopieerd' : 'Kopieer'}</button></div>
        </div>
      ) : p.locked ? (
        <div className="code-box">
          <span className="eyebrow">Kortingscode voor leden</span>
          <div className="code-row"><span className="code num muted" aria-hidden="true">••••••</span><Link className="btn btn-gold btn-sm" href="/profiel?terug=1">Meld je aan</Link></div>
          <span className="small muted">Alleen je naam en e-mail, dan zie je de code direct.</span>
        </div>
      ) : null}
      {p.how && <p className="small muted">{p.how}</p>}
      {p.url && <a className="link" href={p.url} target="_blank" rel="noopener noreferrer">Naar de website ↗</a>}
    </section>
  );
}
