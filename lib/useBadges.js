'use client';
// Badges ophalen en bijwerken, gedeeld door de badges-pagina, het profiel en het unlock-scherm.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '@/components/AppProvider';
import { computeBadges, recentTuesdays, trainingDates } from './badges';
import { todayISO } from './club';

let cache = null;            // laatste antwoord van de server
const subs = new Set();
const publish = (v) => { cache = v; subs.forEach((f) => f(v)); };

export function useBadges({ demo = false } = {}) {
  const { local } = useApp();
  const [live, setState] = useState(cache);
  const demoData = useMemo(() => (demo ? demoState() : null), [demo]);
  const state = demo ? demoData : live;
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const f = (v) => setState(v);
    subs.add(f);
    if (cache) setState(cache);
    return () => subs.delete(f);
  }, []);

  useEffect(() => {
    if (demo || !local?.device || cache) return;
    fetch('/api/badges?device=' + encodeURIComponent(local.device), { cache: 'no-store' })
      .then((r) => r.json()).then((j) => { if (!j.error) publish(j); }).catch(() => {});
  }, [demo, local?.device]);

  const post = useCallback(async (body) => {
    if (demo || !local?.device) return null;
    setBusy(true);
    try {
      const r = await fetch('/api/badges', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ device: local.device, ...body }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Dat lukte niet.');
      publish(j);
      return j;
    } finally { setBusy(false); }
  }, [demo, local?.device]);

  const sync = useCallback((force = false) => post({ action: 'sync', force }), [post]);
  const checkin = useCallback((eventId) => post({ action: 'checkin', eventId }), [post]);
  return { state, busy, sync, checkin };
}

// Voorbeelddata om het ontwerp te bekijken zonder Strava (/badges?demo=1)
export function demoState() {
  const today = todayISO();
  const tues = trainingDates(today);
  const pick = tues.filter((d, i) => i % 3 !== 1 || d > '2026-09-15'); // een paar gemist, de laatste weken allemaal
  const log = [
    ...pick.map((d) => ({ key: 'training-' + d, date: d, source: d === tues[tues.length - 1] ? 'checkin' : 'strava', distance: 12500 })),
    { key: 'event:backyard-2026', date: '2026-10-31', source: 'strava' },
    { key: 'challenge-2026-09-26', date: '2026-09-26', source: 'strava' },
    { key: 'challenge-2026-10-31', date: '2026-10-31', source: 'strava' },
  ];
  const challenges = [{ date: '2026-09-26', seconds: 1332 }, { date: '2026-10-31', seconds: 1301 }];
  return {
    ready: true, demo: true, configured: true, connected: true, today,
    badges: computeBadges({ log, challenges, memberSince: '2025-07', today }),
    tuesdays: recentTuesdays(log, today),
    sources: Object.fromEntries(log.map((l) => [l.key, l.source])),
  };
}
