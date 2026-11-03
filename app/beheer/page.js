'use client';
import { useState } from 'react';
import { useApp } from '@/components/AppProvider';
import { TYPE_LABEL, fmt } from '@/lib/content';

const EMPTY = { id: '', type: 'special', title: '', date: '', time: '', place: '', description: '', distances: '', capacity: '', registration: true, carpool: false, replaces_training: false, url: '' };

export default function Beheer() {
  const { toast, refresh } = useApp();
  const [pw, setPw] = useState('');
  const [d, setD] = useState(null);
  const [ev, setEv] = useState(EMPTY);
  const [notify, setNotify] = useState(true);
  const [news, setNews] = useState({ author: 'Bestuur', title: '', body: '', event_id: '' });
  const [imp, setImp] = useState({ eventId: '', names: '' });
  const P0 = { id: '', name: '', about: '', benefit: '', code: '', how: '', url: '', sort: '' };
  const [par, setPar] = useState(P0);
  const [med, setMed] = useState({ outlet: '', title: '', published: '', url: '', summary: '' });
  const [push, setPush] = useState({ title: '', body: '', pref: 'events' });

  async function call(action, payload = {}, ok) {
    const r = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw, action, ...payload }) });
    const j = await r.json();
    if (!r.ok) { toast(j.error || 'Dat lukte niet.'); return null; }
    if (j.events) setD(j);
    if (ok) toast(typeof ok === 'function' ? ok(j) : ok);
    refresh();
    return j;
  }

  if (!d) return (
    <>
      <h1>Beheer</h1>
      <form className="panel" onSubmit={(e) => { e.preventDefault(); call('load'); }}>
        <div className="field"><label htmlFor="pw">Wachtwoord</label><input className="input" id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" /></div>
        <button className="btn btn-gold" type="submit">Inloggen</button>
      </form>
    </>
  );

  const field = (k, label, props = {}) => (
    <div className="field"><label htmlFor={'ev-' + k}>{label}</label><input className="input" id={'ev-' + k} value={ev[k] ?? ''} onChange={(e) => setEv({ ...ev, [k]: e.target.value })} {...props} /></div>
  );
  const flag = (k, label) => <label><input type="checkbox" checked={!!ev[k]} onChange={(e) => setEv({ ...ev, [k]: e.target.checked })} /> {label}</label>;
  const count = (id) => d.participants.filter((p) => p.event_id === id).length;

  return (
    <div className="view admin">
      <h1>Beheer</h1>
      <div className="panel small">
        <b>Status</b>
        <span>Database: {d.status.database ? '✓ Supabase gekoppeld' : '⚠ tijdelijke opslag (stel Supabase in)'}</span>
        <span>Pushmeldingen: {d.status.push ? `✓ aan · ${d.subscribers} abonnees` : '⚠ VAPID-sleutels ontbreken'}</span>
        <span>Foto&apos;s: {d.photos?.length ?? 0} op de wall</span>
      </div>

      <section className="section">
        <h2>{ev.id ? 'Evenement bewerken' : 'Nieuw evenement'}</h2>
        <form className="panel" onSubmit={async (e) => { e.preventDefault(); if (await call('saveEvent', { event: ev, notify: !ev.id && notify }, 'Opgeslagen')) setEv(EMPTY); }}>
          <div className="field"><label htmlFor="ev-type">Soort</label>
            <select className="input" id="ev-type" value={ev.type} onChange={(e) => setEv({ ...ev, type: e.target.value })}>{['special', 'wedstrijd', 'challenge', 'training'].map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}</select></div>
          {field('title', 'Titel', { required: true })}
          <div className="grid2">{field('date', 'Datum', { type: 'date', required: true })}{field('time', 'Tijd', { type: 'time' })}</div>
          {field('place', 'Locatie')}
          {field('distances', 'Afstanden')}
          {field('url', 'Link naar info/inschrijven (optioneel)', { type: 'url', placeholder: 'https://' })}
          <div className="field"><label htmlFor="ev-desc">Omschrijving</label><textarea className="input" id="ev-desc" value={ev.description} onChange={(e) => setEv({ ...ev, description: e.target.value })} /></div>
          {field('capacity', 'Max. deelnemers (leeg = geen max.)', { type: 'number', min: 1 })}
          {ev.type !== 'training' && <Details ev={ev} setEv={setEv} upload={(img) => call('uploadImage', { image: img })} />}
          <div className="check-row">{flag('registration', 'Inschrijven')}{flag('carpool', 'Carpool')}{flag('replaces_training', 'Vervangt de dinsdagtraining')}</div>
          {!ev.id && <div className="check-row"><label><input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /> Stuur een pushmelding</label></div>}
          <div className="btn-row"><button className="btn btn-gold" type="submit">Opslaan</button>{ev.id && <button className="btn btn-line" type="button" onClick={() => setEv(EMPTY)}>Annuleren</button>}</div>
        </form>
        <div className="list">
          {d.events.map((e) => (
            <div key={e.id} className="row" style={{ gridTemplateColumns: '1fr auto', cursor: 'default' }}>
              <span style={{ minWidth: 0 }}><span className="t"><span className={'tag ' + e.type}>{TYPE_LABEL[e.type]}</span>{e.title}</span><br /><span className="s">{e.date} · {count(e.id)} aangemeld</span></span>
              <span className="btn-row" style={{ gap: 6 }}>
                <button className="link" onClick={() => { setEv({ ...EMPTY, ...e, capacity: e.capacity ?? '', details: e.details || {} }); window.scrollTo(0, 0); }}>Bewerk</button>
                <DeleteButton onConfirm={() => call('deleteEvent', { id: e.id }, 'Verwijderd')} />
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Aanmeldingen toevoegen</h2>
        <p className="small muted">Neem namen over van bijvoorbeeld een Strava-event. Eén naam per regel. Dubbele namen worden overgeslagen.</p>
        <form className="panel" onSubmit={async (e) => { e.preventDefault(); if (await call('addParticipants', imp, (r) => `${r.added ?? 0} ${r.added === 1 ? 'naam' : 'namen'} toegevoegd`)) setImp({ ...imp, names: '' }); }}>
          <div className="field"><label htmlFor="imp-ev">Evenement</label>
            <select className="input" id="imp-ev" value={imp.eventId} onChange={(e) => setImp({ ...imp, eventId: e.target.value })} required>
              <option value="">Kies…</option>
              {(d.upcoming || []).map((e) => <option key={e.id} value={e.id}>{e.date} · {e.title}</option>)}
            </select></div>
          <div className="field"><label htmlFor="imp-names">Namen</label>
            <textarea className="input" id="imp-names" rows={6} value={imp.names} onChange={(e) => setImp({ ...imp, names: e.target.value })} placeholder={'Sanne de Vries\nPieter Jansen\nMark'} required /></div>
          <button className="btn btn-gold" type="submit">Toevoegen</button>
          {imp.eventId && d.participants.some((p) => p.event_id === imp.eventId) && (
            <div className="section" style={{ gap: 6 }}>
              <b className="small">Nu aangemeld ({d.participants.filter((p) => p.event_id === imp.eventId).length})</b>
              {d.participants.filter((p) => p.event_id === imp.eventId).map((p) => (
                <div key={p.device_id} className="setrow small"><span>{p.name}{p.device_id.startsWith('beheer-') ? <span className="muted"> · toegevoegd door beheer</span> : null}</span>
                  <DeleteButton onConfirm={() => call('removeParticipant', { eventId: imp.eventId, device: p.device_id }, 'Verwijderd')} /></div>
              ))}
            </div>
          )}
        </form>
      </section>

      <section className="section">
        <h2>Partners</h2>
        <form className="panel" onSubmit={async (e) => { e.preventDefault(); if (await call('savePartner', { partner: par }, 'Opgeslagen')) setPar(P0); }}>
          <div className="field"><label htmlFor="pa-name">Naam</label><input className="input" id="pa-name" value={par.name} onChange={(e) => setPar({ ...par, name: e.target.value })} required /></div>
          <div className="field"><label htmlFor="pa-about">Korte uitleg</label><textarea className="input" id="pa-about" value={par.about} onChange={(e) => setPar({ ...par, about: e.target.value })} /></div>
          <div className="field"><label htmlFor="pa-benefit">Voordeel voor leden</label><input className="input" id="pa-benefit" value={par.benefit} onChange={(e) => setPar({ ...par, benefit: e.target.value })} placeholder="10% korting op schoenen en kleding" /></div>
          <div className="grid2"><div className="field"><label htmlFor="pa-code">Kortingscode (optioneel)</label><input className="input" id="pa-code" value={par.code} onChange={(e) => setPar({ ...par, code: e.target.value })} /></div><div className="field"><label htmlFor="pa-sort">Volgorde</label><input className="input" id="pa-sort" value={par.sort} onChange={(e) => setPar({ ...par, sort: e.target.value })} type="number" /></div></div>
          <div className="field"><label htmlFor="pa-how">Hoe krijg je de korting?</label><input className="input" id="pa-how" value={par.how} onChange={(e) => setPar({ ...par, how: e.target.value })} placeholder="Vul de code in bij het afrekenen" /></div>
          <div className="field"><label htmlFor="pa-url">Website (optioneel)</label><input className="input" id="pa-url" value={par.url} onChange={(e) => setPar({ ...par, url: e.target.value })} type="url" placeholder="https://" /></div>
          <div className="btn-row"><button className="btn btn-gold" type="submit">{par.id ? 'Opslaan' : 'Partner toevoegen'}</button>{par.id && <button type="button" className="btn btn-line" onClick={() => setPar(P0)}>Annuleren</button>}</div>
        </form>
        <div className="list">{(d.partners || []).map((p) => (
          <div key={p.id} className="row" style={{ gridTemplateColumns: '1fr auto', cursor: 'default' }}><span><span className="t">{p.name}</span><br /><span className="s">{p.benefit}{p.code ? ' · code ' + p.code : ''}</span></span>
            <span className="btn-row" style={{ gap: 6 }}><button className="link" onClick={() => { setPar({ ...P0, ...p, sort: p.sort ?? '' }); window.scrollTo(0, 0); }}>Bewerk</button><DeleteButton onConfirm={() => call('deletePartner', { id: p.id }, 'Verwijderd')} /></span></div>
        ))}</div>
      </section>

      <section className="section">
        <h2>BenneKOM in de media</h2>
        <form className="panel" onSubmit={async (e) => { e.preventDefault(); if (await call('saveMedia', { media: med }, 'Toegevoegd')) setMed({ outlet: '', title: '', published: '', url: '', summary: '' }); }}>
          <div className="grid2">
            <div className="field"><label htmlFor="md-outlet">Medium</label><input className="input" id="md-outlet" value={med.outlet} onChange={(e) => setMed({ ...med, outlet: e.target.value })} placeholder="Ede Stad" required /></div>
            <div className="field"><label htmlFor="md-pub">Maand</label><input className="input" id="md-pub" type="month" value={med.published} onChange={(e) => setMed({ ...med, published: e.target.value })} /></div>
          </div>
          <div className="field"><label htmlFor="md-title">Titel</label><input className="input" id="md-title" value={med.title} onChange={(e) => setMed({ ...med, title: e.target.value })} required /></div>
          <div className="field"><label htmlFor="md-url">Link naar het artikel</label><input className="input" id="md-url" type="url" value={med.url} onChange={(e) => setMed({ ...med, url: e.target.value })} placeholder="https://" /></div>
          <div className="field"><label htmlFor="md-sum">Korte samenvatting</label><textarea className="input" id="md-sum" value={med.summary} onChange={(e) => setMed({ ...med, summary: e.target.value })} /></div>
          <button className="btn btn-gold" type="submit">Toevoegen</button>
        </form>
        <div className="list">{(d.media || []).map((m) => (
          <div key={m.id} className="row" style={{ gridTemplateColumns: '1fr auto', cursor: 'default' }}><span><span className="t">{m.title}</span><br /><span className="s">{m.outlet}{m.published ? ' · ' + m.published : ''}</span></span><DeleteButton onConfirm={() => call('deleteMedia', { id: m.id }, 'Verwijderd')} /></div>
        ))}</div>
      </section>

      <section className="section">
        <h2>Nieuwsbericht</h2>
        <form className="panel" onSubmit={async (e) => { e.preventDefault(); if (await call('saveNews', { news }, 'Geplaatst')) setNews({ ...news, title: '', body: '', event_id: '' }); }}>
          <div className="grid2">
            <div className="field"><label htmlFor="n-author">Van</label><input className="input" id="n-author" value={news.author} onChange={(e) => setNews({ ...news, author: e.target.value })} /></div>
            <div className="field"><label htmlFor="n-ev">Koppel aan evenement</label><select className="input" id="n-ev" value={news.event_id} onChange={(e) => setNews({ ...news, event_id: e.target.value })}><option value="">Geen</option>{d.events.map((e) => <option key={e.id} value={e.id}>{e.title} ({e.date})</option>)}</select></div>
          </div>
          <div className="field"><label htmlFor="n-title">Titel</label><input className="input" id="n-title" value={news.title} onChange={(e) => setNews({ ...news, title: e.target.value })} required /></div>
          <div className="field"><label htmlFor="n-body">Tekst</label><textarea className="input" id="n-body" value={news.body} onChange={(e) => setNews({ ...news, body: e.target.value })} /></div>
          <button className="btn btn-gold" type="submit">Plaatsen</button>
        </form>
        <div className="list">{d.news.map((n) => (
          <div key={n.id} className="row" style={{ gridTemplateColumns: '1fr auto', cursor: 'default' }}><span><span className="t">{n.title}</span><br /><span className="s">{n.author} · {n.published_at}</span></span><DeleteButton onConfirm={() => call('deleteNews', { id: n.id }, 'Verwijderd')} /></div>
        ))}</div>
      </section>

      <section className="section">
        <h2>Pushmelding sturen</h2>
        <form className="panel" onSubmit={async (e) => { e.preventDefault(); const j = await call('push', push, (r) => `Verstuurd naar ${r.pushed?.sent ?? 0} telefoons`); if (j) setPush({ ...push, title: '', body: '' }); }}>
          <div className="field"><label htmlFor="p-title">Titel</label><input className="input" id="p-title" value={push.title} onChange={(e) => setPush({ ...push, title: e.target.value })} required /></div>
          <div className="field"><label htmlFor="p-body">Tekst</label><input className="input" id="p-body" value={push.body} onChange={(e) => setPush({ ...push, body: e.target.value })} /></div>
          <div className="field"><label htmlFor="p-pref">Naar wie</label><select className="input" id="p-pref" value={push.pref} onChange={(e) => setPush({ ...push, pref: e.target.value })}>
            <option value="events">Iedereen met &apos;specials en wedstrijden&apos; aan</option><option value="training">Trainingsherinnering aan</option><option value="challenge">5km Challenge aan</option><option value="shirt">Bestelronde clubshirt aan</option></select></div>
          <button className="btn btn-gold" type="submit">Versturen</button>
        </form>
      </section>

      <section className="section">
        <h2>Fotowall</h2>
        <p className="small muted">Ster = groot op de homepagina achter de trainingskaart.</p>
        {d.photos?.length ? <div className="admin-photos">{d.photos.map((p) => (
          <div key={p.id} className="admin-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={p.caption || ''} loading="lazy" />
            <span className="small">{p.name}{p.caption ? ' · ' + p.caption : ''}</span>
            <span className="btn-row" style={{ gap: 8 }}>
              <button className="link" onClick={() => call('featurePhoto', { id: p.id }, p.featured ? 'Niet meer uitgelicht' : 'Uitgelicht op de homepagina')}>{p.featured ? '★ Uitgelicht' : '☆ Uitlichten'}</button>
              <DeleteButton onConfirm={() => call('deletePhoto', { id: p.id }, 'Foto verwijderd')} />
            </span>
          </div>
        ))}</div> : <p className="muted">Nog geen foto&apos;s geplaatst.</p>}
      </section>

      <section className="section">
        <h2>Clubshirts: interesse</h2>
        {d.shirts?.length ? (
          <>
            <div className="panel small">
              {['kort', 'lang'].map((it) => {
                const rows = d.shirts.filter((r) => r.item === it);
                const per = {}; rows.forEach((r) => { per[r.size] = (per[r.size] || 0) + (r.qty || 1); });
                const tot = rows.reduce((n, r) => n + (r.qty || 1), 0);
                return <span key={it}><b>{it === 'kort' ? 'Korte mouw' : 'Lange mouw'}: {tot}</b>{tot > 0 && ' · ' + Object.entries(per).map(([s, n]) => `${s} ${n}`).join(', ')}</span>;
              })}
            </div>
            <div className="list">{d.shirts.map((r) => (
              <div key={r.device_id + r.item} className="row" style={{ gridTemplateColumns: '1fr', cursor: 'default' }}><span><span className="t">{r.name || 'onbekend'}</span><br /><span className="s">{r.item === 'kort' ? 'Korte mouw' : 'Lange mouw'} · maat {r.size} · {r.qty || 1}×</span></span></div>
            ))}</div>
          </>
        ) : <p className="muted">Nog niemand heeft een shirt aangevinkt.</p>}
      </section>

      <section className="section">
        <h2>Voorstellen van leden</h2>
        {d.suggestions.length ? <div className="list">{d.suggestions.map((s) => (
          <div key={s.id} className="row" style={{ gridTemplateColumns: '1fr auto', cursor: 'default' }}><span><span className="t">{s.name}</span><br /><span className="s">{s.date || 'geen datum'} · {s.place || '–'} · van {s.by_name || 'onbekend'}</span></span>
            <span className="btn-row" style={{ gap: 6 }}><button className="link" onClick={() => { setEv({ ...EMPTY, type: 'wedstrijd', title: s.name, date: s.date || '', place: s.place, registration: false, carpool: true }); window.scrollTo(0, 0); }}>Overnemen</button><DeleteButton onConfirm={() => call('deleteSuggestion', { id: s.id }, 'Verwijderd')} /></span></div>
        ))}</div> : <p className="muted">Geen nieuwe voorstellen.</p>}
      </section>

      <section className="section">
        <h2>5km Challenge-tijden</h2>
        {d.results.length ? <div className="list">{d.results.sort((a, b) => a.seconds - b.seconds).map((r) => (
          <div key={r.id} className="row" style={{ gridTemplateColumns: '1fr auto', cursor: 'default' }}><span><span className="t">{r.name} · <span className="num">{fmt(r.seconds)}</span></span><br /><span className="s">{r.edition}</span></span><DeleteButton onConfirm={() => call('deleteResult', { id: r.id }, 'Verwijderd')} /></div>
        ))}</div> : <p className="muted">Nog geen tijden.</p>}
      </section>
    </div>
  );
}

// Verwijderen met bevestiging in de pagina zelf
function DeleteButton({ onConfirm }) {
  const [sure, setSure] = useState(false);
  return sure
    ? <button className="link" style={{ color: '#C0392B' }} onClick={() => { setSure(false); onConfirm(); }}>Zeker?</button>
    : <button className="link" onClick={() => { setSure(true); setTimeout(() => setSure(false), 3000); }}>Verwijder</button>;
}

// Verkleint een gekozen foto in de browser tot max. 1600 px (JPEG)
function shrink(file, max = 1600) {
  return new Promise((ok, fail) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      ok(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = fail;
    img.src = URL.createObjectURL(file);
  });
}

function ImagePick({ id, label, value, onChange, upload }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {value && /* eslint-disable-next-line @next/next/no-img-element */ <img src={value} alt="" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8 }} />}
      <input id={id} type="file" accept="image/*" disabled={busy} onChange={async (e) => {
        const f = e.target.files?.[0]; if (!f) return;
        setBusy(true);
        try { const r = await upload(await shrink(f)); if (r?.url) onChange(r.url); } finally { setBusy(false); e.target.value = ''; }
      }} />
      {busy && <span className="small muted">Uploaden…</span>}
      {value && <button type="button" className="link" style={{ alignSelf: 'flex-start' }} onClick={() => onChange('')}>Foto weghalen</button>}
    </div>
  );
}

function Details({ ev, setEv, upload }) {
  const dt = ev.details || {};
  const host = dt.host || {};
  const set = (k, v) => setEv({ ...ev, details: { ...dt, [k]: v } });
  const setHost = (k, v) => set('host', { ...host, [k]: v });
  const area = (k, label, ph, rows = 4) => (
    <div className="field"><label htmlFor={'dt-' + k}>{label}</label><textarea className="input" rows={rows} id={'dt-' + k} value={dt[k] || ''} placeholder={ph} onChange={(e) => set(k, e.target.value)} /></div>
  );
  return (
    <fieldset className="panel" style={{ background: 'transparent' }}>
      <b>Extra informatie op de eventpagina</b>
      <ImagePick id="dt-image" label="Sfeerfoto bovenaan" value={dt.image} onChange={(v) => set('image', v)} upload={upload} />
      {area('story', 'Het verhaal (wat gaan we doen, waarom leuk)', 'Een paar alinea\'s over het evenement', 6)}
      {area('program', 'Programma (één onderdeel per regel, tijd vooraan)', '18:00 Verzamelen\n18:15 Start')}
      {area('bring', 'Wat neem je mee (één per regel)', 'Handdoek\nDroge kleren', 3)}
      <div className="field"><label htmlFor="dt-cost">Kosten</label><input className="input" id="dt-cost" value={dt.cost || ''} placeholder="Gratis, of bijv. €10 incl. eten" onChange={(e) => set('cost', e.target.value)} /></div>
      <b>Gastspreker of partner (optioneel)</b>
      <div className="grid2">
        <div className="field"><label htmlFor="dt-hn">Naam</label><input className="input" id="dt-hn" value={host.name || ''} onChange={(e) => setHost('name', e.target.value)} /></div>
        <div className="field"><label htmlFor="dt-hr">Rol of bedrijf</label><input className="input" id="dt-hr" value={host.role || ''} onChange={(e) => setHost('role', e.target.value)} /></div>
      </div>
      <div className="field"><label htmlFor="dt-hb">Over deze persoon</label><textarea className="input" rows={3} id="dt-hb" value={host.bio || ''} onChange={(e) => setHost('bio', e.target.value)} /></div>
      <ImagePick id="dt-hp" label="Foto van de gastspreker" value={host.photo} onChange={(v) => setHost('photo', v)} upload={upload} />
    </fieldset>
  );
}
