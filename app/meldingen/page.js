'use client';
import { useEffect, useState } from 'react';
import { useApp } from '@/components/AppProvider';
import { Loading, Switch } from '@/components/ui';
import { NOTIF_TYPES } from '@/lib/content';

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function keyToBytes(base64) {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export default function Meldingen() {
  const { local, updateLocal, act, toast } = useApp();
  const [status, setStatus] = useState('laden'); // laden | geen-support | ios-installeren | uit | aan | geblokkeerd | niet-ingesteld
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
      if (!VAPID) return setStatus('niet-ingesteld');
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return setStatus(ios && !standalone ? 'ios-installeren' : 'geen-support');
      if (Notification.permission === 'denied') return setStatus('geblokkeerd');
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setStatus(sub ? 'aan' : 'uit');
    })().catch(() => setStatus('geen-support'));
  }, []);

  if (!local) return <Loading />;

  async function enable() {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { setStatus(perm === 'denied' ? 'geblokkeerd' : 'uit'); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(VAPID) });
      if (await act('subscribe', { subscription: sub.toJSON(), prefs: local.notif })) { setStatus('aan'); toast('Meldingen staan aan'); }
    } catch { toast('Aanzetten lukte niet. Probeer het opnieuw.'); }
    finally { setBusy(false); }
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) { await act('unsubscribe', { endpoint: sub.endpoint }); await sub.unsubscribe(); }
      setStatus('uit'); toast('Meldingen staan uit');
    } finally { setBusy(false); }
  }

  async function setPref(k, v) {
    const notif = { ...local.notif, [k]: v };
    updateLocal({ notif });
    if (status === 'aan') {
      const sub = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
      if (sub) await act('subscribe', { subscription: sub.toJSON(), prefs: notif });
    }
  }

  const MSG = {
    'ios-installeren': 'Op de iPhone werken meldingen alleen als je BenneKOM eerst op je beginscherm zet: tik op Deel en kies Zet op beginscherm. Open de app daarna vanaf je beginscherm.',
    'geen-support': 'Deze browser ondersteunt geen pushmeldingen. Probeer Chrome of Safari.',
    geblokkeerd: 'Meldingen zijn geblokkeerd. Zet ze aan bij de instellingen van je telefoon of browser voor deze site.',
    'niet-ingesteld': 'Pushmeldingen zijn nog niet ingesteld door de beheerder.',
  };

  return (
    <>
      <h1>Meldingen</h1>
      <p className="muted">Kies waarover je een pushmelding op je telefoon wilt krijgen.</p>
      {MSG[status] ? <p className="note">{MSG[status]}</p> : (
        <div className="panel setrow" style={{ flexDirection: 'row' }}>
          <span><b>{status === 'aan' ? 'Meldingen staan aan' : 'Meldingen staan uit'}</b><br /><span className="small muted">Op dit apparaat</span></span>
          {status === 'aan'
            ? <button className="btn btn-line btn-sm" disabled={busy} onClick={disable}>Uitzetten</button>
            : <button className="btn btn-gold btn-sm" disabled={busy || status === 'laden'} onClick={enable}>Aanzetten</button>}
        </div>
      )}
      <div className="panel">
        {NOTIF_TYPES.map(([k, l, d]) => (
          <div key={k} className="setrow">
            <span><b>{l}</b><br /><span className="small muted">{d}</span></span>
            <Switch id={'n-' + k} checked={!!local.notif[k]} onChange={(v) => setPref(k, v)} label={l} />
          </div>
        ))}
      </div>
    </>
  );
}
