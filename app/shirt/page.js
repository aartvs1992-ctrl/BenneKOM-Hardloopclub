'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import { Loading, ErrorNote, useReady, People } from '@/components/ui';
import { SHIRTS, SIZES, euro } from '@/lib/content';

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
        <img src="/club/shirt-product.jpg" alt="BenneKOM clubshirt van Bioracer" />
      </div>
      <h2>Zo staat hij aan</h2>
      <div className="shirt-photos">
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/club/shirt-voorkant.jpg" alt="Loper in het nieuwe BenneKOM clubshirt" style={{ objectPosition: 'center 15%' }} />
          <figcaption>Heren</figcaption>
        </figure>
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/club/shirt-dames.jpg" alt="Loopster in het nieuwe BenneKOM clubshirt" style={{ objectPosition: 'center 30%' }} />
          <figcaption>Dames</figcaption>
        </figure>
      </div>

      <div className="panel flag-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/club/vlag-bennekom.jpg" alt="De vlag van Bennekom" />
        <div style={{ minWidth: 0 }}>
          <b>Geïnspireerd op de vlag van Bennekom</b>
          <p>Het shirt draagt de kleuren van ons dorp: het blauw en geel van de Bennekomse vlag. Zo loop je overal herkenbaar als BenneKOM.</p>
        </div>
      </div>

      <Link className="panel join-card" href="/singlet">
        <span style={{ minWidth: 0 }}><b>Nieuw: de BenneKOM race singlet</b><br /><span className="small muted">Beperkte oplage van 25 stuks. Claim de jouwe.</span></span>
        <span className="chev">›</span>
      </Link>

      <div className="panel callout">
        <b>We bestellen alleen in grotere aantallen</b>
        <p>De shirts worden per bestelronde gemaakt. Vink hieronder aan welk shirt je wilt, met je maat. Zodra er genoeg aanmeldingen zijn, plaatsen we de bestelling en hoor je hoe je betaalt en wanneer je hem krijgt. Aanvinken is nog geen bestelling. De prijzen zijn indicatief.</p>
        {data.shirtCount > 0 && <span className="small muted">Er zijn nu {data.shirtCount} shirts aangevinkt.</span>}
      </div>

      {SHIRTS.map((s) => <ShirtRow key={s.id} s={s} />)}

      <p className="note">Wil je weten wanneer de bestelling geplaatst wordt? Zet de <Link href="/meldingen">melding voor de bestelronde</Link> aan.</p>
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

  return (
    <div className={'panel shirt-row' + (checked ? ' on' : '')}>
      <label className="shirt-check">
        <input type="checkbox" checked={checked} onChange={async (e) => {
          if (e.target.checked) setOpen(true);
          else if (mine) await act('shirt', { item: s.id, on: false }, 'Uitgevinkt');
          else setOpen(false);
        }} />
        <span style={{ minWidth: 0 }}><b>{s.name}</b><br /><span className="small muted">{s.note}</span></span>
        <span style={{ textAlign: 'right' }}><span className="num" style={{ fontWeight: 700 }}>± {euro(s.price)}</span><br /><span className="small muted">indicatief</span></span>
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
        </div>
      )}
    </div>
  );
}
