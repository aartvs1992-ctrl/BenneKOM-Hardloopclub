'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { NOTIF_TYPES } from '@/lib/content';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const LS = 'bennekom-app';
function readLocal() {
  try { return JSON.parse(localStorage.getItem(LS) || '{}'); } catch { return {}; }
}
function writeLocal(v) {
  try { localStorage.setItem(LS, JSON.stringify(v)); } catch {}
}
const newId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
const DEFAULT_NOTIF = Object.fromEntries(NOTIF_TYPES.map(([k]) => [k, k !== 'shirt']));

export default function AppProvider({ children }) {
  const [local, setLocal] = useState(null); // { device, name, done:[], notif:{} }
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const t = useRef();

  useEffect(() => {
    const l = readLocal();
    const v = { device: l.device || newId(), name: l.name || '', done: l.done || [], notif: { ...DEFAULT_NOTIF, ...(l.notif || {}) } };
    writeLocal(v);
    setLocal(v);
  }, []);

  const updateLocal = useCallback((patch) => {
    setLocal((prev) => { const v = { ...prev, ...patch }; writeLocal(v); return v; });
  }, []);

  const toast = useCallback((m) => {
    setToastMsg(m);
    clearTimeout(t.current);
    t.current = setTimeout(() => setToastMsg(''), 2600);
  }, []);

  const refresh = useCallback(async () => {
    if (!local?.device) return;
    try {
      const r = await fetch('/api/state?device=' + encodeURIComponent(local.device), { cache: 'no-store' });
      if (!r.ok) throw new Error();
      setData(await r.json());
      setError('');
    } catch {
      setError('Geen verbinding. Je ziet de laatst geladen gegevens.');
    }
  }, [local?.device]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);

  // Service worker registreren (installeerbaar + pushmeldingen)
  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);

  const act = useCallback(async (action, payload = {}, okMsg) => {
    try {
      const r = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, device: local.device, name: payload.name ?? local.name, ...payload }),
      });
      const j = await r.json();
      if (!r.ok) { toast(j.error || 'Dat lukte niet.'); return false; }
      if (j.events) setData(j);
      if (okMsg) toast(okMsg);
      return true;
    } catch {
      toast('Geen verbinding. Probeer het zo nog eens.');
      return false;
    }
  }, [local, toast]);

  return (
    <Ctx.Provider value={{ local, updateLocal, data, error, refresh, act, toast }}>
      {children}
      {toastMsg ? <div className="toast" role="status">{toastMsg}</div> : null}
    </Ctx.Provider>
  );
}
