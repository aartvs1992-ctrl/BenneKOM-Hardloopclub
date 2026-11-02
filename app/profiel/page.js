'use client';
import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/components/AppProvider';
import { Loading, Avatar, MemberSheet } from '@/components/ui';
import AvatarCropper from '@/components/AvatarCropper';

export default function Profiel() {
  const { local, updateLocal, refresh, toast } = useApp();
  const [prof, setProf] = useState(undefined); // undefined = laden, null = nog geen profiel
  const EMPTY = { first_name: '', last_name: '', song: '', member_since: '', fun_fact: '', work: '' };
  const [f, setF] = useState(EMPTY);
  const [cropFile, setCropFile] = useState(null);
  const [preview, setPreview] = useState(false);
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
        if (j.profile) setF({ ...EMPTY, ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, j.profile[k] || ''])) });
        else if (local.name) { const [a, ...b] = local.name.split(' '); setF({ ...EMPTY, first_name: a, last_name: b.join(' ') }); }
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
    setCropFile(file);
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
    try { await post({ action: 'delete' }); setProf(null); setF(EMPTY); updateLocal({ name: '' }); await refresh(); toast('Profiel verwijderd'); }
    catch (err) { toast(err.message); }
    finally { setBusy(false); setSure(false); }
  }

  const card = prof && { name: prof.name, avatar: prof.avatar, since: prof.member_since, song: prof.song, work: prof.work, fact: prof.fun_fact, me: true };
  const shown = removePhoto ? null : photo || prof?.avatar;
  const fullName = [f.first_name, f.last_name].filter(Boolean).join(' ');

  return (
    <>
      <h1>{prof ? 'Mijn profiel' : 'Word lid van de app'}</h1>
      {!prof && <p className="muted">Maak je profiel aan met je naam en een foto. Dan zien andere lopers wie er komt, en jij herkent ze bij de training.</p>}
      {back && !prof && <p className="note">Maak eerst je profiel aan, dan zetten we je meteen op de lijst.</p>}

      {cropFile && (
        <section className="panel">
          <AvatarCropper file={cropFile} onCancel={() => setCropFile(null)} onDone={(d) => { setPhoto(d); setRemovePhoto(false); setCropFile(null); }} />
        </section>
      )}

      <form className="panel profile-form" onSubmit={save} hidden={!!cropFile}>
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
        <h3 style={{ marginTop: 4 }}>Leer elkaar kennen <span className="muted small">(allemaal optioneel)</span></h3>
        <div className="field"><label htmlFor="pf-since">Lid sinds</label>
          <input className="input" id="pf-since" type="month" min="2025-01" max={new Date().toISOString().slice(0, 7)} value={f.member_since} onChange={(e) => setF({ ...f, member_since: e.target.value })} /></div>
        <div className="field"><label htmlFor="pf-song">Favoriete nummer tijdens het sporten</label>
          <input className="input" id="pf-song" value={f.song} onChange={(e) => setF({ ...f, song: e.target.value })} placeholder="Artiest – titel" maxLength={80} /></div>
        <div className="field"><label htmlFor="pf-work">Wat doe je voor werk?</label>
          <input className="input" id="pf-work" value={f.work} onChange={(e) => setF({ ...f, work: e.target.value })} placeholder="Bijv. docent, monteur, student" maxLength={80} /></div>
        <div className="field"><label htmlFor="pf-fact">Wat weten mensen bij de club nog niet over je?</label>
          <textarea className="input" id="pf-fact" rows={2} value={f.fun_fact} onChange={(e) => setF({ ...f, fun_fact: e.target.value })} placeholder="Iets leuks of verrassends" maxLength={200} /></div>
        <button className="btn btn-gold" type="submit" disabled={busy}>{busy ? 'Bezig met opslaan…' : prof ? 'Opslaan' : 'Profiel aanmaken'}</button>
        <p className="note">Je naam, foto en antwoorden zijn zichtbaar voor iedereen die de app gebruikt. Anderen zien ze als ze op je gezicht tikken.</p>
        {prof && <button type="button" className="link" style={{ alignSelf: 'flex-start' }} onClick={() => setPreview(true)}>Bekijk hoe anderen je kaart zien ›</button>}
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
      {preview && card && <MemberSheet p={card} onClose={() => setPreview(false)} />}
    </>
  );
}
