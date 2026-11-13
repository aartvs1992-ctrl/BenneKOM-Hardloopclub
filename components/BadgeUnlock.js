'use client';
// Het moment dat je een nieuwe badge hebt: een scherm met de badge groot in beeld.
// BadgeWatcher kijkt bij het openen van de app (op de achtergrond) of er nieuwe badges zijn.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from './AppProvider';
import Badge from './Badge';
import { TIERS, TIER_ORDER } from '@/lib/badges';
import { useBadges } from '@/lib/useBadges';

const SEEN = 'bennekom-badges-seen';
const readSeen = (device) => { try { const v = JSON.parse(localStorage.getItem(SEEN) || 'null'); return v?.device === device ? v.ids : null; } catch { return null; } };
const writeSeen = (device, ids) => { try { localStorage.setItem(SEEN, JSON.stringify({ device, ids })); } catch {} };

export const byRarity = (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) || String(b.date).localeCompare(String(a.date));

export function UnlockSheet({ list, onClose }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  if (!list?.length) return null;
  const [top, ...rest] = [...list].sort(byRarity);
  const t = TIERS[top.tier];
  return (
    <div className="sheet-bg unlock-bg" onClick={onClose}>
      <div className="unlock" role="dialog" aria-modal="true" aria-label={'Nieuwe badge: ' + top.name} onClick={(e) => e.stopPropagation()}>
        <p className="unlock-eyebrow">{list.length > 1 ? `${list.length} nieuwe badges` : 'Nieuwe badge vrijgespeeld'}</p>
        <div className={'unlock-glow tier-' + top.tier}><Badge b={top} size={200} /></div>
        <span className="tier-chip" style={{ '--c': t.c1 }}><i />{t.name}{top.cat === 'events' ? ' · eenmalig' : ''}</span>
        <h2 className="unlock-title">{top.name}</h2>
        <p className="unlock-text">{top.crit}</p>
        {rest.length > 0 && (
          <div className="unlock-more">
            {rest.slice(0, 6).map((b) => <Badge key={b.id} b={b} size={52} />)}
            {rest.length > 6 && <span className="muted small">+{rest.length - 6}</span>}
          </div>
        )}
        <div className="unlock-actions">
          <Link className="btn btn-gold" href="/badges" onClick={onClose}>Bekijk je badges</Link>
          <button className="btn btn-line" onClick={onClose}>Sluiten</button>
        </div>
      </div>
    </div>
  );
}

// Op de achtergrond nieuwe Strava-loopjes ophalen en nieuwe badges laten zien
export function BadgeWatcher() {
  const { local, data } = useApp();
  const { state, sync } = useBadges();
  const [fresh, setFresh] = useState(null);
  const device = local?.device;

  useEffect(() => {
    if (!device || !data?.me) return;
    const t = setTimeout(() => { sync().catch(() => {}); }, 1500);
    return () => clearTimeout(t);
  }, [device, data?.me, sync]);

  useEffect(() => {
    if (!device || !state?.ready || state.demo) return;
    const earned = state.badges.filter((b) => b.earned);
    const seen = readSeen(device);
    const ids = earned.map((b) => b.id);
    const nw = earned.filter((b) => !(seen || []).includes(b.id));
    if (nw.length) setFresh((prev) => [...(prev || []), ...nw.filter((b) => !(prev || []).some((p) => p.id === b.id))]);
    writeSeen(device, [...new Set([...(seen || []), ...ids])]);
  }, [device, state]);

  return fresh ? <UnlockSheet list={fresh} onClose={() => setFresh(null)} /> : null;
}
