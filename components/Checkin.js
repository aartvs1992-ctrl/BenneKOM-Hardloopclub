'use client';
// "Ik was erbij": op de dag zelf inchecken, zodat de training of het event meetelt voor je badges.
// Voor leden zonder Strava; met Strava gaat het ook vanzelf.
import { useApp } from './AppProvider';
import { useBadges } from '@/lib/useBadges';
import { BADGE_EVENTS } from '@/lib/badges';
import { todayISO } from '@/lib/club';

const toMin = (hm) => { const [h, m] = String(hm || '0:0').split(':').map(Number); return h * 60 + (m || 0); };

export default function Checkin({ e, going }) {
  const { toast } = useApp();
  const { state, busy, checkin } = useBadges();
  const counts = e.type === 'training' || BADGE_EVENTS.some((b) => b.eventIds.includes(e.id));
  if (!going || !counts || e.date !== todayISO()) return null;
  const now = new Date().toLocaleTimeString('nl-NL', { timeZone: 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit', hour12: false });
  if (e.time && toMin(now) < toMin(e.time) - 30) return null;
  const key = e.type === 'training' ? 'training-' + e.date : 'event:' + BADGE_EVENTS.find((b) => b.eventIds.includes(e.id))?.key;
  const done = Boolean(state?.sources?.[key]);
  if (done) return <button className="btn btn-done" disabled>✓ Ingecheckt · telt mee voor je badges</button>;
  return (
    <button className="btn btn-gold" disabled={busy} onClick={async () => {
      try { await checkin(e.id); toast('Ingecheckt! Deze telt mee voor je badges.'); }
      catch (err) { toast(err.message); }
    }}>{busy ? 'Even geduld…' : 'Ik was erbij'}</button>
  );
}
