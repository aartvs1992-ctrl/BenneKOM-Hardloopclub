'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import { Loading } from '@/components/ui';

export default function Feedback() {
  const { local, data } = useApp();
  const [msg, setMsg] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [trap, setTrap] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [sent, setSent] = useState(false);
  if (!local) return <Loading />;
  const me = data?.me;

  async function send(e) {
    e.preventDefault();
    if (busy || msg.trim().length < 3) return;
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/feedback', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, name: name || local.name, email, device: local.device, website: trap, page: document.referrer || '' }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Versturen lukte niet. Probeer het later nog eens.');
      setSent(true); setMsg('');
    } catch (e2) { setErr(e2.message); }
    setBusy(false);
  }

  if (sent) {
    return (
      <>
        <h1>Bedankt!</h1>
        <div className="panel callout">
          <b>Je bericht is binnen</b>
          <p>Aart leest alles zelf. Met jouw tip wordt de app en de club weer een stukje beter.</p>
        </div>
        <div className="btn-row">
          <button className="btn btn-line" onClick={() => setSent(false)}>Nog iets kwijt</button>
          <Link className="btn btn-gold" href="/meer">Terug</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <h1>Idee of verbeterpunt?</h1>
      <p>Zie je iets wat beter kan in de app of bij de club, loopt er iets mis, of heb je een leuk idee? Laat het weten. Je bericht komt direct bij Aart binnen.</p>
      <form className="panel" onSubmit={send} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="field">
          <label htmlFor="fb-msg">Jouw bericht</label>
          <textarea className="input" id="fb-msg" rows={6} maxLength={3000} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Bijv. een knop die niet werkt, een idee voor een special of een training die je mist" style={{ minHeight: 140, resize: 'vertical' }} />
        </div>
        {me ? (
          <span className="small muted">Je stuurt dit als <b>{me.name}</b>, zodat Aart je kan terugmailen.</span>
        ) : (
          <div className="grid2">
            <div className="field"><label htmlFor="fb-name">Naam (optioneel)</label><input className="input" id="fb-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
            <div className="field"><label htmlFor="fb-mail">E-mail (optioneel)</label><input className="input" id="fb-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="Voor een reactie" /></div>
          </div>
        )}
        <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trap} onChange={(e) => setTrap(e.target.value)} style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }} />
        {err && <p className="small" style={{ color: '#C0392B', margin: 0 }}>{err}</p>}
        <button className="btn btn-gold" type="submit" disabled={busy || msg.trim().length < 3}>{busy ? 'Versturen…' : 'Verstuur naar Aart'}</button>
      </form>
    </>
  );
}
