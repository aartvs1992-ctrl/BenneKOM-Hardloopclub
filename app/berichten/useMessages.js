'use client';
import { useCallback, useEffect, useState } from 'react';
import { useApp } from '@/components/AppProvider';

// Berichten ophalen (en elke paar seconden verversen zolang de pagina open is)
// Laatst geladen berichten per gesprek, zodat terugkeren meteen iets toont
const cache = {};

export function useMessages(withId, every = 0) {
  const { local, refresh, toast } = useApp();
  const key = withId || '';
  const [v, setVRaw] = useState(() => cache[key] || null);
  const setV = useCallback((x) => { cache[key] = x; setVRaw(x); }, [key]);
  const [err, setErr] = useState('');
  const load = useCallback(async () => {
    if (!local?.device) return;
    try {
      const r = await fetch(`/api/messages?device=${encodeURIComponent(local.device)}${withId ? '&with=' + encodeURIComponent(withId) : ''}`, { cache: 'no-store' });
      const j = await r.json();
      if (!r.ok) { setErr(j.error || 'Laden lukte niet.'); return; }
      setErr(''); setV(j);
    } catch { setErr('Geen verbinding.'); }
  }, [local?.device, withId, setV]);

  useEffect(() => { load().then(() => { if (withId) refresh(); }); }, [load, refresh, withId]);
  useEffect(() => {
    if (!every) return;
    const t = setInterval(() => { if (document.visibilityState === 'visible') load(); }, every);
    return () => clearInterval(t);
  }, [load, every]);

  const post = useCallback(async (body) => {
    try {
      const r = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ device: local.device, with: withId, ...body }) });
      const j = await r.json();
      if (!r.ok) { toast(j.error || 'Dat lukte niet.'); return false; }
      setV(j); refresh(); return true;
    } catch { toast('Geen verbinding. Probeer het zo nog eens.'); return false; }
  }, [local?.device, withId, toast, refresh, setV]);

  return { v, err, post, load };
}

export const when = (iso) => {
  const d = new Date(iso), now = new Date();
  const opts = { timeZone: 'Europe/Amsterdam' };
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('nl-NL', { ...opts, hour: '2-digit', minute: '2-digit' });
  if (now - d < 6 * 864e5) return d.toLocaleDateString('nl-NL', { ...opts, weekday: 'short' });
  return d.toLocaleDateString('nl-NL', { ...opts, day: 'numeric', month: 'short' });
};
