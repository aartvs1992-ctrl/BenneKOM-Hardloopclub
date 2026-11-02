'use client';
import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/components/AppProvider';
import { Loading, Avatar } from '@/components/ui';
import { squareAvatar } from '@/lib/usePhotos';

export default function Profiel() {
  const { local, updateLocal, refresh, toast } = useApp();
  const [prof, setProf] = useState(undefined); // undefined = laden, null = nog geen profiel
  const [f, setF] = useState({ first_name: '', last_name: '', about: '' });
  const [photo, setPhoto] = useState(null);   // nieuwe foto (data-URL)
  const [removePhoto, setRemovePhoto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [back, setBack] = useState(false);
  const [code, setCode] = useState('');
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [sure, setSure] = useState(false);
  const input = useRef(null);

  useEffect(() => { setBack(new URLSearchParams(location.search).has('terug')); }, []);
  useEffect(() => {
    if (!local?.device) return;
    fetch('/api/profile?device=' + encodeURIComponent(local.device), { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => {
        setProf(j.profile);
        if (j.profile) setF({ first_name: j.profile.first_name, last_name: j.profile.last_name, about: j.profile.about });
        else if (local.name) { const [a, ...b] = local.name.split(' '); setF({ first_name: a, last_name: b.join(' '), about: '' }); }
      })
      .catch(() => setProf(null));
  }, [local?.device, local?.name]);

  if (!local || prof === undefined) return <Loading />;

  async function post(body) {
    const r = await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ device: local.device, ...body }) });
    const j = await r.json().catch(() => ({ error: 'De foto is te groot. Probeer een andere.' }));
    if (!r.ok) throw new Error(j.error || 'Dat lukte niet.');
    return j;
  }

  async function pick(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try { setPhoto(await squareAvatar(file)); setRemovePhoto(false); }
    catch { toast('Deze foto kan niet worden gelezen. Probeer een andere.'); }
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const j = await post({ action: 'save', ...f, photo, removePhoto });
      setProf(j.profile); setPhoto(null); setRemovePhoto(false);
      updateLocal({ name: j.profile.name });
      await refresh();
      toast(prof ? 'Profiel bijgewerkt' : 'Welkom bij BenneKOM, ' + j.profile.first_name + '!');
      if (back) history.back();
    } catch (err) { toast(err.message); }
    finally { setBusy(false); }
  }

  async function restore(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const j = await post({ action: 'restore', code });
      updateLocal({ device: j.device, name: j.profile.name });
      toast('Profiel gevonden! De app laadt opnieuw.');
      setTimeout(() => location.assign('/'), 800);
    } catch (err) { toast(err.message); setBusy(false); }
  }

  async function del() {
    setBusy(true);
    try { await post({ action: 'delete' }); setProf(null); setF({ first_name: '', last_name: '', about: '' }); updateLocal({ name: '' }); await refresh(); toast('Profiel verwijderd'); }
    catch (err) { toast(err.message); }
    finally { setBusy(false); setSure(false); }
  }

  const shown = removePhoto ? null : photo || prof?.avatar;
  const fullName = [f.first_name, f.last_name].filter(Boolean).join(' ');

  return (
    <>
      <h1>{prof ? 'Mijn profiel' : 'Word lid van de app'}</h1>
      {!prof && <p className="muted">Maak je profiel aan met je naam en een foto. Dan zien andere lopers wie er komt, en jij herkent ze bij de training.</p>}
      {back && !prof && <p className="note">Maak eerst je profiel aan, dan zetten we je meteen op de lijst.</p>}

      <form className="panel profile-form" onSubmit={save}>
        <div className="avatar-pick">
          <button type="button" className="avatar-btn" onClick={() => input.current.click()} aria-label="Kies een profielfoto">
            <Avatar name={fullName} src={shown} size={112} />
            <span className="avatar-cam" aria-hidden="true">📷</span>
          </button>
          <div className="section" style={{ gap: 6 }}>
            <button type="button" className="btn btn-line btn-sm" onClick={() => input.current.click()}>{shown ? 'Andere foto' : 'Foto kiezen'}</button>
            {shown && <button type="button" className="link small" onClick={() => { setPhoto(null); setRemovePhoto(true); }}>Foto weghalen</button>}
            <span className="small muted">Een foto waarop je gezicht goed te zien is.</span>
          </div>
          <input ref={input} type="file" accept="image/*" hidden onChange={pick} id="avatar-input" />
        </div>

        <div className="grid2">
          <div className="field"><label htmlFor="pf-first">Voornaam</label><input className="input" id="pf-first" value={f.first_name} onChange={(e) => setF({ ...f, first_name: e.target.value })} autoComplete="given-name" required maxLength={40} /></div>
          <div className="field"><label htmlFor="pf-last">Achternaam</label><input className="input" id="pf-last" value={f.last_name} onChange={(e) => setF({ ...f, last_name: e.target.value })} autoComplete="family-name" maxLength={60} /></div>
        </div>
        <div className="field"><label htmlFor="pf-about">Over jou <span className="muted">(optioneel)</span></label>
          <input className="input" id="pf-about" value={f.about} onChange={(e) => setF({ ...f, about: e.target.value })} placeholder="Bijv. Loop sinds 2025 mee, op weg naar mijn eerste halve" maxLength={140} /></div>
        <button className="btn btn-gold" type="submit" disabled={busy}>{busy ? 'Bezig met opslaan…' : prof ? 'Opslaan' : 'Profiel aanmaken'}</button>
        <p className="note">Je naam en foto zijn zichtbaar voor iedereen die de app gebruikt, bijvoorbeeld bij wie er komt trainen.</p>
      </form>

      {prof ? (
        <section className="panel">
          <h3>Op een ander toestel</h3>
          <p className="small">Gebruik deze code om je profiel op een andere telefoon of computer te openen. Deel hem met niemand.</p>
          <p className="restore-code num">{prof.restore_code}</p>
          <div className="btn-row">
            {sure
              ? <button className="btn btn-sm btn-danger" onClick={del} disabled={busy}>Zeker verwijderen?</button>
              : <button className="btn btn-line btn-sm" onClick={() => setSure(true)}>Profiel verwijderen</button>}
          </div>
        </section>
      ) : (
        <section className="panel">
          {!restoreOpen ? (
            <button className="link" style={{ alignSelf: 'flex-start' }} onClick={() => setRestoreOpen(true)}>Heb je al een profiel op een ander toestel?</button>
          ) : (
            <form className="section" onSubmit={restore}>
              <h3>Profiel openen met je code</h3>
              <p className="small muted">Je vindt de code in de app op je andere toestel, onder Meer → Mijn profiel.</p>
              <div className="field"><label htmlFor="pf-code">Code</label><input className="input num" id="pf-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ABCD2345" autoCapitalize="characters" required /></div>
              <button className="btn btn-gold" type="submit" disabled={busy}>Profiel openen</button>
            </form>
          )}
        </section>
      )}
    </>
  );
}
