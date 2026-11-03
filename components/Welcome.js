'use client';
// Beginscherm voor wie nog niet is aangemeld: één sfeerbeeld, wat je krijgt, en aanmelden met naam en e-mail.
// De rest van de app (agenda, foto's, partners) gaat pas open na het aanmelden.
import { useState } from 'react';
import { useApp } from './AppProvider';

const ok = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

export default function Welcome() {
  const { local, updateLocal, refresh, toast } = useApp();
  const [f, setF] = useState({ first_name: '', last_name: '', email: '' });
  const [busy, setBusy] = useState(false);
  const [restore, setRestore] = useState(false);
  const [code, setCode] = useState('');

  async function post(body) {
    const r = await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ device: local?.device, ...body }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || 'Dat lukte niet. Probeer het opnieuw.');
    return j;
  }

  async function signup(e) {
    e.preventDefault();
    if (!ok(f.email)) return toast('Vul een geldig e-mailadres in.');
    setBusy(true);
    try {
      const j = await post({ action: 'save', ...f });
      updateLocal({ name: j.profile.name });
      await refresh();
      toast('Welkom bij BenneKOM, ' + j.profile.first_name + '!');
      window.scrollTo(0, 0);
    } catch (err) { toast(err.message); setBusy(false); }
  }

  async function open(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const j = await post({ action: 'restore', code });
      updateLocal({ device: j.device, name: j.profile.name });
      toast('Gevonden! De app laadt opnieuw.');
      setTimeout(() => location.reload(), 600);
    } catch (err) { toast(err.message); setBusy(false); }
  }

  return (
    <div className="welcome">
      <section className="welcome-hero">
        <video className="welcome-video" src="/media/backyard-montage.mp4" poster="/media/backyard-montage.jpg"
          autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
        <div className="welcome-shade" aria-hidden="true" />
        <div className="welcome-top">
          <span className="crown" aria-hidden="true">♛</span>
          <span className="brand">Benne<b>KOM</b></span>
          <span className="welcome-sub">hardloopclub</span>
        </div>
        <div className="welcome-claim">
          <h1>Samen lopen in Bennekom</h1>
          <p>Dinsdag en donderdag, elk niveau. Iedereen is welkom.</p>
        </div>
      </section>

      <section className="welcome-body">
        <ul className="welcome-perks">
          <li><span aria-hidden="true">🔔</span><span><b>Een seintje vooraf</b><br />welke training we doen en wie er komt</span></li>
          <li><span aria-hidden="true">🏷️</span><span><b>Kortingscodes</b><br />bij onze partners</span></li>
          <li><span aria-hidden="true">🏃</span><span><b>Samen naar wedstrijden</b><br />zien wie meedoet, met carpool</span></li>
          <li><span aria-hidden="true">👑</span><span><b>Toegang tot de BenneKOM-community</b><br />clubfoto&apos;s, de lopers achter de club en alle clubevenementen</span></li>
        </ul>

        {!restore ? (
          <form className="panel profile-form" onSubmit={signup}>
            <b>Meld je aan, het duurt tien seconden</b>
            <div className="grid2">
              <div className="field"><label htmlFor="w-first">Voornaam</label><input className="input" id="w-first" value={f.first_name} onChange={(e) => setF({ ...f, first_name: e.target.value })} autoComplete="given-name" required maxLength={40} /></div>
              <div className="field"><label htmlFor="w-last">Achternaam</label><input className="input" id="w-last" value={f.last_name} onChange={(e) => setF({ ...f, last_name: e.target.value })} autoComplete="family-name" maxLength={60} /></div>
            </div>
            <div className="field"><label htmlFor="w-mail">E-mail</label><input className="input" id="w-mail" type="email" inputMode="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" required maxLength={120} /></div>
            <button className="btn btn-gold" type="submit" disabled={busy || !local}>{busy ? 'Even geduld…' : 'Aanmelden'}</button>
            <span className="small muted">Je e-mail is alleen voor de club. Een foto en de rest kun je later toevoegen.</span>
          </form>
        ) : (
          <form className="panel profile-form" onSubmit={open}>
            <b>Open je profiel met je code</b>
            <span className="small muted">Je vindt de code in de app op je andere toestel, onder Meer → Mijn profiel.</span>
            <div className="field"><label htmlFor="w-code">Code</label><input className="input num" id="w-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ABCD2345" autoCapitalize="characters" required /></div>
            <button className="btn btn-gold" type="submit" disabled={busy}>Profiel openen</button>
          </form>
        )}
        <button className="link" style={{ alignSelf: 'center' }} onClick={() => setRestore(!restore)}>
          {restore ? '‹ Terug naar aanmelden' : 'Al aangemeld op een ander toestel?'}
        </button>
      </section>
    </div>
  );
}
