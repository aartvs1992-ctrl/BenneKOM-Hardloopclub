'use client';
// Het moment dat je een nieuwe badge hebt: een scherm met de badge groot in beeld.
// BadgeWatcher kijkt bij het openen van de app (op de achtergrond) of er nieuwe badges zijn.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from './AppProvider';
import Badge from './Badge';
import { BADGES, TIERS, TIER_ORDER } from '@/lib/badges';
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
// Eenmalige uitleg bij het openen van de app: wat badges zijn en dat ze op je profiel staan (uit te zetten)
const INTRO = 'bennekom-badges-intro';
export function BadgeIntro({ state, setShown, onClose }) {
  const [busy, setBusy] = useState(false);
  const shown = state?.shown !== false;
  const sample = ['vaste-prik', 'backyard-2026', 'onbreekbaar'].map((id) => BADGES.find((b) => b.id === id)).filter(Boolean);
  return (
    <div className="sheet-bg unlock-bg">
      <div className="unlock" role="dialog" aria-modal="true" aria-label="Nieuw: badges">
        <p className="unlock-eyebrow">Nieuw in de app</p>
        <div className="unlock-more">{sample.map((b) => <Badge key={b.id} b={b} size={80} />)}</div>
        <h2 className="unlock-title">Badges</h2>
        <p className="unlock-text">Verdien badges met de dinsdagtrainingen, de 5k Challenge en specials zoals de Backyard Run. Met Strava gekoppeld tellen ook je trainingen van vroeger mee.</p>
        <label className="intro-toggle">
          <span><b>Laat mijn badges zien op mijn profiel</b><br /><span className="small">Clubgenoten zien je aantal en je top 3. Nooit je loopjes, tijden of kilometers. Uitzetten kan altijd, ook later bij Mijn badges.</span></span>
          <input type="checkbox" role="switch" checked={shown} disabled={busy || !state}
            onChange={async (e) => { setBusy(true); try { await setShown(e.target.checked); } catch {} setBusy(false); }} />
        </label>
        <div className="unlock-actions">
          <Link className="btn btn-gold" href="/badges" onClick={onClose}>Bekijk mijn badges</Link>
          <button className="btn btn-line" onClick={onClose}>Oké</button>
        </div>
      </div>
    </div>
  );
}

export function BadgeWatcher() {
  const { local, data } = useApp();
  const { state, sync, setShown } = useBadges();
  const [fresh, setFresh] = useState(null);
  const [intro, setIntro] = useState(false);
  const device = local?.device;
  useEffect(() => { try { if (!localStorage.getItem(INTRO)) setIntro(true); } catch {} }, []);
  const closeIntro = () => { try { localStorage.setItem(INTRO, '1'); } catch {} setIntro(false); };

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

  if (intro) return <BadgeIntro state={state} setShown={setShown} onClose={closeIntro} />;
  return fresh ? <UnlockSheet list={fresh} onClose={() => setFresh(null)} /> : null;
}
