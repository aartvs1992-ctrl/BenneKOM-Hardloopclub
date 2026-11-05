'use client';
import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/components/AppProvider';
import { Loading, Avatar, MemberSheet } from '@/components/ui';
import AvatarCropper from '@/components/AvatarCropper';

export default function Profiel() {
  const { local, updateLocal, refresh, toast } = useApp();
  const [prof, setProf] = useState(undefined); // undefined = laden, null = nog geen profiel
  const EMPTY = { first_name: '', last_name: '', email: '', song: '', member_since: '', fun_fact: '', work: '', best_run: '' };
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
      toast(prof ? 'Profiel bijgewerkt' : 'Welkom bij BenneKOM, ' + j.profile.first_name + '! De kortingscodes staan voor je klaar.');
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

  const card = prof && { name: prof.name, avatar: prof.avatar, since: prof.member_since, song: prof.song, work: prof.work, fact: prof.fun_fact, best: prof.best_run, me: true };
  const shown = removePhoto ? null : photo || prof?.avatar;
  const fullName = [f.first_name, f.last_name].filter(Boolean).join(' ');

  return (
    <>
      <h1>{prof ? 'Mijn profiel' : 'Meld je aan'}</h1>
      {!prof && (
        <>
          <p className="lead">Alleen je naam en e-mail. Dan krijg je:</p>
          <ul className="perks">
            <li><b>Kortingscodes</b> van onze partners</li>
            <li><b>Een seintje</b> over de training en clubevenementen</li>
            <li>Zien <b>wie er meedoet</b>, en zelf meedoen met één tik</li>
          </ul>
          {back && <p className="note">Meld je eerst aan, dan gaan we meteen verder.</p>}
          <form className="panel profile-form" onSubmit={save}>
            <div className="grid2">
              <div className="field"><label htmlFor="su-first">Voornaam</label><input className="input" id="su-first" value={f.first_name} onChange={(e) => setF({ ...f, first_name: e.target.value })} autoComplete="given-name" required maxLength={40} /></div>
              <div className="field"><label htmlFor="su-last">Achternaam</label><input className="input" id="su-last" value={f.last_name} onChange={(e) => setF({ ...f, last_name: e.target.value })} autoComplete="family-name" maxLength={60} /></div>
            </div>
            <div className="field"><label htmlFor="su-mail">E-mail</label><input className="input" id="su-mail" type="email" inputMode="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" required maxLength={120} /></div>
            <button className="btn btn-gold" type="submit" disabled={busy}>{busy ? 'Even geduld…' : 'Aanmelden'}</button>
            <p className="note">Je e-mail is alleen voor de club en wordt niet getoond. Een foto en wat leuke vragen kun je later toevoegen.</p>
          </form>
        </>
      )}
      {prof && !prof.avatar && !prof.song && !prof.best_run && !prof.work && !prof.fun_fact && (
        <p className="note"><b>Maak je profiel af.</b> Met een foto en een paar leuke antwoorden herkennen anderen je bij de training. Alles is optioneel.</p>
      )}

      {cropFile && (
        <section className="panel">
          <AvatarCropper file={cropFile} onCancel={() => setCropFile(null)} onDone={(d) => { setPhoto(d); setRemovePhoto(false); setCropFile(null); }} />
        </section>
      )}

      {prof && <form className="panel profile-form" onSubmit={save} hidden={!!cropFile}>
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
        <div className="field"><label htmlFor="pf-mail">E-mail <span className="muted small">(niet zichtbaar voor anderen)</span></label><input className="input" id="pf-mail" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" maxLength={120} /></div>
        <h3 style={{ marginTop: 4 }}>Leer elkaar kennen <span className="muted small">(allemaal optioneel)</span></h3>
        <div className="field"><label htmlFor="pf-since">Lid sinds?</label>
          <input className="input" id="pf-since" type="month" min="2025-01" max={new Date().toISOString().slice(0, 7)} value={f.member_since} onChange={(e) => setF({ ...f, member_since: e.target.value })} /></div>
        <div className="field"><label htmlFor="pf-best">Mooiste hardloopervaring?</label>
          <textarea className="input" id="pf-best" rows={2} value={f.best_run} onChange={(e) => setF({ ...f, best_run: e.target.value })} placeholder="Bijv. mijn eerste halve marathon, of die zonsopkomst op de Ginkelse heide" maxLength={200} /></div>
        <div className="field"><label htmlFor="pf-song">Favoriete hardloopnummer?</label>
          <input className="input" id="pf-song" value={f.song} onChange={(e) => setF({ ...f, song: e.target.value })} placeholder="Artiest – titel" maxLength={80} /></div>
        <div className="field"><label htmlFor="pf-work">Werk?</label>
          <input className="input" id="pf-work" value={f.work} onChange={(e) => setF({ ...f, work: e.target.value })} placeholder="Bijv. docent, monteur, student" maxLength={80} /></div>
        <div className="field"><label htmlFor="pf-fact">Wat zou mensen over je verbazen? <span className="muted">(iets wat velen niet weten 😉)</span></label>
          <textarea className="input" id="pf-fact" rows={2} value={f.fun_fact} onChange={(e) => setF({ ...f, fun_fact: e.target.value })} placeholder="Iets leuks of verrassends" maxLength={200} /></div>
        <button className="btn btn-gold" type="submit" disabled={busy}>{busy ? 'Bezig met opslaan…' : prof ? 'Opslaan' : 'Profiel aanmaken'}</button>
        <p className="note">Je naam, foto en antwoorden zijn zichtbaar voor iedereen die de app gebruikt. Anderen zien ze als ze op je gezicht tikken. Je e-mail niet.</p>
        <button type="button" className="link" style={{ alignSelf: 'flex-start' }} onClick={() => setPreview(true)}>Bekijk hoe anderen je kaart zien ›</button>
      </form>}

      {prof ? (
        <section className="panel">
          <h3>Op een ander toestel</h3>
          <p className="small">Op je computer of een andere telefoon log je in met je e-mailadres: je krijgt een code per mail. Lukt dat niet, gebruik dan deze code. Deel hem met niemand.</p>
          <p className="restore-code num">{prof.restore_code}</p>
          <div className="btn-row">
            <button className="btn btn-line btn-sm" disabled={busy} onClick={async () => {
              await fetch('/api/session', { method: 'POST' }).catch(() => {});
              updateLocal({ device: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), name: '' });
              location.assign('/');
            }}>Uitloggen op dit toestel</button>
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
