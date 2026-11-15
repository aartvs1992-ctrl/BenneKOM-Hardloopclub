'use client';
// Badges op het profiel van een loper: aantal, top 3 en de nieuwste, met uitklappen voor de rest.
// Alleen als die loper dat zelf heeft aangezet (Mijn badges). Nooit loopjes, tijden of kilometers.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Badge from './Badge';
import { useBadges } from '@/lib/useBadges';
import { TIER_ORDER, TIERS } from '@/lib/badges';

const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
const short = (iso) => { const d = new Date(String(iso).slice(0, 10) + 'T12:00:00Z'); return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
const rarest = (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) || String(b.date).localeCompare(String(a.date));

export default function MemberBadges({ p }) {
  const own = useBadges();
  const [other, setOther] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (p.me || !p.bh) return;
    let gone = false;
    fetch('/api/badges?of=' + encodeURIComponent(p.bh), { cache: 'no-store' })
      .then((r) => r.json()).then((j) => { if (!gone) setOther(j); }).catch(() => {});
    return () => { gone = true; };
  }, [p.me, p.bh]);

  if (p.me) {
    const st = own.state;
    if (!st) return null;
    if (!st.shown) return <p className="small muted" style={{ textAlign: 'center' }}>Je badges staan niet op je profiel. <Link href="/badges">Zet ze aan bij Mijn badges</Link></p>;
    return <Block list={st.badges.filter((b) => b.earned)} open={open} setOpen={setOpen} />;
  }
  if (!other?.shown || !other.badges?.length) return null;
  return <Block list={other.badges} open={open} setOpen={setOpen} />;
}

function Block({ list, open, setOpen }) {
  if (!list.length) return null;
  const sorted = [...list].sort(rarest);
  const top = sorted.slice(0, 3);
  const latest = [...list].sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
  return (
    <section className="member-badges">
      <div className="section-head"><h3>Badges</h3><span className="badge-count num" style={{ fontSize: 20 }}>{list.length}</span></div>
      <div className="mb-top">
        {top.map((b) => (
          <div key={b.id} className="mb-item">
            <Badge b={b} size={76} />
            <span className="mb-name">{b.name}</span>
            <span className="mb-tier">{TIERS[b.tier].name}</span>
          </div>
        ))}
      </div>
      {latest && <p className="small muted" style={{ textAlign: 'center' }}>Nieuwste: <b>{latest.name}</b>{latest.date ? ' · ' + short(latest.date) : ''}</p>}
      {list.length > 3 && (
        open
          ? <>
              <div className="badge-grid">
                {sorted.slice(3).map((b) => (
                  <div key={b.id} className="badge-cell" style={{ cursor: 'default' }}>
                    <Badge b={b} size={64} />
                    <span>{b.name}</span>
                  </div>
                ))}
              </div>
              <button type="button" className="link" onClick={() => setOpen(false)}>Minder tonen</button>
            </>
          : <button type="button" className="link" onClick={() => setOpen(true)}>Alle {list.length} badges bekijken ›</button>
      )}
    </section>
  );
}
