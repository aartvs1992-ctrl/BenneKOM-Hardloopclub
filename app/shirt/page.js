'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import { Loading, ErrorNote, useReady, People } from '@/components/ui';
import { SHIRTS, SIZES, euro, PAY, SHIRT_ROUND } from '@/lib/content';
import PayBox from '@/components/PayBox';
import { thumb } from '@/lib/img';

export default function Shirt() {
  const { data } = useApp();
  if (!useReady()) return <Loading />;
  return (
    <>
      <ErrorNote />
      <h1>Clubshirt</h1>
      <p>Navy camo met gele boord en het BenneKOM-logo met kroontje, gemaakt door Bioracer. Loop je mee in clubkleuren?</p>

      <div className="shirt-product">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumb('/club/shirt-product.jpg', 828)} alt="BenneKOM clubshirt van Bioracer" />
      </div>
      <h2>Zo staat hij aan</h2>
      <div className="shirt-photos">
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb('/club/shirt-voorkant.jpg', 828)} alt="Loper in het nieuwe BenneKOM clubshirt" style={{ objectPosition: 'center 15%' }} />
          <figcaption>Heren</figcaption>
        </figure>
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb('/club/shirt-dames.jpg', 828)} alt="Loopster in het nieuwe BenneKOM clubshirt" style={{ objectPosition: 'center 30%' }} />
          <figcaption>Dames</figcaption>
        </figure>
      </div>

      <div className="panel flag-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumb('/club/vlag-bennekom.jpg', 828)} alt="De vlag van Bennekom" />
        <div style={{ minWidth: 0 }}>
          <b>Geïnspireerd op de vlag van Bennekom</b>
          <p>Het shirt draagt de kleuren van ons dorp: het blauw en geel van de Bennekomse vlag. Zo loop je overal herkenbaar als BenneKOM.</p>
        </div>
      </div>

      {SHIRT_ROUND.closed ? (
      <div className="panel callout">
        <b>Besteld! Deze bestelronde is gesloten</b>
        <p>De shirts zijn besteld bij Bioracer en worden {SHIRT_ROUND.delivery} geleverd. Sta je op de lijst? Betaal hieronder je shirt in de app met iDEAL.</p>
        <p className="small muted" style={{ margin: 0 }}>Deze ronde gemist? Bij de volgende bestelronde kun je weer aanvinken.</p>
        {data.shirtCount > 0 && <span className="small muted">In totaal {data.shirtCount} shirts besteld.</span>}
      </div>
      ) : (
      <div className="panel callout">
        <b>We bestellen alleen in grotere aantallen</b>
        <p>De shirts worden per bestelronde gemaakt. Vink hieronder aan welk shirt je wilt, met je maat. {PAY.shirts ? 'De bestelronde loopt: vink je shirt aan met je maat en betaal meteen hier in de app met iDEAL. Betaald = besteld.' : 'Zodra er genoeg aanmeldingen zijn, plaatsen we de bestelling en hoor je hoe je betaalt en wanneer je hem krijgt. Aanvinken is nog geen bestelling.'}</p>
        {data.shirtCount > 0 && <span className="small muted">Er zijn nu {data.shirtCount} shirts aangevinkt.</span>}
      </div>
      )}

      {SHIRTS.filter((s) => s.id !== 'singlet').map((s) => <ShirtRow key={s.id} s={s} />)}

      <h2>Singlet</h2>
      <p>De clubsinglet van Bioracer, in hetzelfde navy camo met gele boord als het clubshirt. Ideaal voor warme dagen en wedstrijden.</p>
      <div className="shirt-photos">
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb('/club/singlet-bioracer.jpg', 828)} alt="BenneKOM clubsinglet van Bioracer" style={{ objectFit: 'contain', background: '#fff' }} />
          <figcaption>Het model</figcaption>
        </figure>
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb('/club/singlet-wilco.jpg', 828)} alt="Wilco in de BenneKOM clubsinglet" />
          <figcaption>Wilco in de singlet</figcaption>
        </figure>
      </div>
      {SHIRTS.filter((s) => s.id === 'singlet').map((s) => <ShirtRow key={s.id} s={s} />)}

      <Link className="panel join-card" href="/singlet">
        <span style={{ minWidth: 0 }}><b>Nog hogere kwaliteit? Kies dan voor de race singlet</b><br /><span className="small muted">Met gelaserde naden en onder de 100 gram. Komt rond 10 december binnen. Geclaimd? Betaal hem daar in de app met iDEAL.</span></span>
        <span className="chev">›</span>
      </Link>

      <p className="note">{SHIRT_ROUND.closed ? 'Wil je weten wanneer de volgende bestelronde opengaat?' : 'Wil je weten wanneer de bestelling geplaatst wordt?'} Zet de <Link href="/meldingen">melding voor de bestelronde</Link> aan.</p>
    </>
  );
}

function ShirtRow({ s }) {
  const { data, local, updateLocal, act } = useApp();
  const mine = data.shirts?.find((x) => x.item === s.id);
  const [size, setSize] = useState(mine?.size || '');
  const [qty, setQty] = useState(mine?.qty || 1);
  const [name, setName] = useState(local.name || '');
  const [open, setOpen] = useState(false);
  const checked = Boolean(mine) || open;
  const needName = !data.me && !local.name;

  async function save() {
    if (!size) return;
    const nm = data.me?.name || name.trim() || local.name;
    if (!nm) return;
    if (!local.name) updateLocal({ name: nm });
    if (await act('shirt', { item: s.id, on: true, size, qty, name: nm }, mine ? 'Aangepast' : 'Aangevinkt: ' + s.name)) setOpen(false);
  }

  if (SHIRT_ROUND.closed) {
    return (
      <div className={'panel shirt-row' + (mine ? ' on' : '')}>
        <div className="shirt-check" style={{ cursor: 'default' }}>
          <span>{mine ? '✓' : ''}</span>
          <span style={{ minWidth: 0 }}><b>{s.name}</b><br /><span className="small muted">{s.note}</span></span>
          <span style={{ textAlign: 'right' }}><span className="num" style={{ fontWeight: 700 }}>{euro(s.price)}</span></span>
        </div>
        {(data.shirtPeople?.[s.id] || []).length > 0 && (
          <div className="shirt-people">
            <span className="small muted">{data.shirtPeople[s.id].length} {data.shirtPeople[s.id].length === 1 ? 'loper heeft' : 'lopers hebben'} besteld</span>
            <People list={data.shirtPeople[s.id]} />
          </div>
        )}
        {mine ? (
          <div className="shirt-form">
            <span className="small muted">Besteld voor jou: maat {mine.size}, {mine.qty}×.</span>
            {PAY.shirts && (
              <PayBox amount={s.price * mine.qty} desc={`${s.name} ${mine.size} ${mine.qty}x ${data.me?.name || local.name || ''}`} paid={mine.paid} reported={mine.paidReported}
                report={{ what: 'shirt', item: s.id }} note={`Besteld bij Bioracer, levering ${SHIRT_ROUND.delivery}. Betaal hier je shirt.`} />
            )}
          </div>
        ) : <span className="small muted">Bestelronde gesloten.</span>}
      </div>
    );
  }

  return (
    <div className={'panel shirt-row' + (checked ? ' on' : '')}>
      <label className="shirt-check">
        <input type="checkbox" checked={checked} onChange={async (e) => {
          if (e.target.checked) setOpen(true);
          else if (mine) await act('shirt', { item: s.id, on: false }, 'Uitgevinkt');
          else setOpen(false);
        }} />
        <span style={{ minWidth: 0 }}><b>{s.name}</b><br /><span className="small muted">{s.note}</span></span>
        <span style={{ textAlign: 'right' }}><span className="num" style={{ fontWeight: 700 }}>{euro(s.price)}</span></span>
      </label>
      {(data.shirtPeople?.[s.id] || []).length > 0 && (
        <div className="shirt-people">
          <span className="small muted">{data.shirtPeople[s.id].length} {data.shirtPeople[s.id].length === 1 ? 'loper heeft' : 'lopers hebben'} interesse</span>
          <People list={data.shirtPeople[s.id]} />
        </div>
      )}
      {checked && (
        <div className="shirt-form">
          <div className="field"><span className="plbl">Maat</span>
            <div className="sizes">{SIZES.map((z) => <button type="button" key={z} className={'size' + (size === z ? ' sel' : '')} onClick={() => setSize(z)}>{z}</button>)}</div>
          </div>
          <div className="grid2">
            <div className="field"><label htmlFor={'q-' + s.id}>Aantal</label>
              <select className="input" id={'q-' + s.id} value={qty} onChange={(e) => setQty(+e.target.value)}>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
            {needName && <div className="field"><label htmlFor={'n-' + s.id}>Jouw naam</label><input className="input" id={'n-' + s.id} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>}
          </div>
          <button className="btn btn-gold" disabled={!size || (needName && !name.trim())} onClick={save}>
            {mine ? (mine.size === size && mine.qty === qty ? '✓ Aangevinkt' : 'Wijziging opslaan') : 'Ik wil deze'}
          </button>
          {mine && <span className="small muted">Je staat op de lijst: maat {mine.size}, {mine.qty}×.</span>}
          {mine && PAY.shirts && (
            <PayBox amount={s.price * mine.qty} desc={`${s.name} ${mine.size} ${mine.qty}x ${data.me?.name || local.name || ''}`} paid={mine.paid} reported={mine.paidReported}
              report={{ what: 'shirt', item: s.id }} note="Besteld bij Bioracer, levering rond de derde week van januari. Betaal hier je shirt." />
          )}
        </div>
      )}
    </div>
  );
}
