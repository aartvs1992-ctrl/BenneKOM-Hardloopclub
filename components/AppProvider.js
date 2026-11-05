'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
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
// Laatst geladen gegevens op het toestel, zodat de app meteen opent
const LS_STATE = 'bennekom-state';
function readState(device) {
  try { const c = JSON.parse(localStorage.getItem(LS_STATE) || 'null'); return c?.device === device ? c.data : null; } catch { return null; }
}
function writeState(device, data) {
  try { localStorage.setItem(LS_STATE, JSON.stringify({ device, data })); } catch {}
}
const newId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
const DEFAULT_NOTIF = Object.fromEntries(NOTIF_TYPES.map(([k]) => [k, k !== 'shirt' && k !== 'samenloop']));

export default function AppProvider({ children }) {
  const [local, setLocal] = useState(null); // { device, name, done:[], notif:{} }
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const t = useRef();
  const dataRef = useRef(null);
  useEffect(() => { dataRef.current = data; }, [data]);
  const deviceRef = useRef(null);
  const fromServer = useCallback((d) => { setData(d); if (deviceRef.current) writeState(deviceRef.current, d); }, []);

  useEffect(() => {
    (async () => {
      const l = readLocal();
      let device = l.device, name = l.name || '';
      // Geen naam in de browser bewaard (nieuw apparaat, gewist geheugen of app op beginscherm)?
      // Dan kijken of dit apparaat je herkent via de inlogcookie.
      if (!device || !name) {
        try {
          const s = await fetch('/api/session', { cache: 'no-store' }).then((r) => r.json());
          if (s.device) { device = s.device; name = s.name || name; }
        } catch {}
      }
      const v = { device: device || newId(), name, done: l.done || [], notif: { ...DEFAULT_NOTIF, ...(l.notif || {}) } };
      writeLocal(v);
      deviceRef.current = v.device;
      const cached = readState(v.device);
      if (cached) setData(cached);
      setLocal(v);
    })();
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
      fromServer(await r.json());
      setError('');
    } catch {
      setError('Geen verbinding. Je ziet de laatst geladen gegevens.');
    }
  }, [local?.device, fromServer]);

  useEffect(() => { refresh(); }, [refresh]);
  // heeft dit toestel een profiel, dan is dat de naam overal in de app
  useEffect(() => {
    if (data?.me?.name && local && data.me.name !== local.name) updateLocal({ name: data.me.name });
  }, [data?.me?.name, local, updateLocal]);
  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);

  // Service worker registreren (installeerbaar + pushmeldingen)
  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').then((r) => r.update()).catch(() => {});
  }, []);

  // Nieuwe versie live gezet? Dan verversen we pas op een rustig moment: als je de app opnieuw
  // opent of naar een andere pagina gaat. Nooit midden in het typen.
  const path = usePathname();
  const pending = useRef(false);
  useEffect(() => {
    let mine = null;
    const check = async () => {
      try {
        const { v } = await (await fetch('/api/version', { cache: 'no-store' })).json();
        if (!v || v === 'dev') return;
        if (mine === null) mine = v;
        else if (v !== mine) pending.current = true;
      } catch {}
    };
    check();
    const onVis = async () => {
      if (document.visibilityState !== 'visible') return;
      await check();
      if (pending.current) location.reload();
    };
    document.addEventListener('visibilitychange', onVis);
    const t = setInterval(check, 2 * 60 * 1000);
    return () => { document.removeEventListener('visibilitychange', onVis); clearInterval(t); };
  }, []);
  useEffect(() => { if (pending.current) location.reload(); }, [path]);

  // Aan- of afmelden meteen zichtbaar maken, nog voordat de server antwoordt
  const optimistic = useCallback((action, payload) => {
    if (action !== 'participate' || !payload.eventId) return false;
    const id = payload.eventId, on = Boolean(payload.on);
    const cur = dataRef.current;
    if (!cur || Boolean(cur.mine[id]) === on) return false;
    setData((d) => {
      if (!d || Boolean(d.mine[id]) === on) return d;
      const nm = d.me?.name || payload.name || local.name || 'Jij';
      const mine = { ...d.mine }, counts = { ...d.counts }, names = { ...d.names };
      const list = (names[id] || []).filter((p) => !p.me);
      if (on) { mine[id] = nm; counts[id] = (counts[id] || 0) + 1; names[id] = [...list, { ...(d.me || {}), name: nm, avatar: d.me?.avatar || null, me: true }]; }
      else { delete mine[id]; counts[id] = Math.max(0, (counts[id] || 1) - 1); names[id] = list; }
      const next = { ...d, mine, counts, names };
      dataRef.current = next;
      return next;
    });
    return true;
  }, [local]);

  const act = useCallback(async (action, payload = {}, okMsg) => {
    const quick = optimistic(action, payload);
    if (quick && okMsg) toast(okMsg);
    try {
      const r = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, device: local.device, name: payload.name ?? local.name, ...payload }),
      });
      const j = await r.json();
      if (!r.ok) { toast(j.error || 'Dat lukte niet.'); if (quick) refresh(); return false; }
      if (j.events) fromServer(j);
      if (okMsg && !quick) toast(okMsg);
      return true;
    } catch {
      toast('Geen verbinding. Probeer het zo nog eens.');
      if (quick) refresh();
      return false;
    }
  }, [local, toast, optimistic, refresh, fromServer]);

  return (
    <Ctx.Provider value={{ local, updateLocal, data, error, refresh, act, toast }}>
      {children}
      {toastMsg ? <div className="toast" role="status">{toastMsg}</div> : null}
    </Ctx.Provider>
  );
}
