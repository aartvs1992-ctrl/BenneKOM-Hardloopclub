'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import { Loading, ErrorNote, useReady, People } from '@/components/ui';
import { SINGLET, euro } from '@/lib/content';

const STATUS = { geclaimd: 'Geclaimd · je hoort wanneer hij binnen is; betalen doe je pas bij overhandiging', opgehaald: 'Overhandigd · het betaalverzoek komt eraan', betaald: 'Betaald · veel plezier ermee!' };

export default function Singlet() {
  const { data, act } = useApp();
  const [size, setSize] = useState('');
  const [busy, setBusy] = useState(false);
  if (!useReady()) return <Loading />;
  const s = data.singlet || {};
  const left = s.left || SINGLET.stock;
  const total = Object.values(SINGLET.stock).reduce((a, b) => a + b, 0);
  const rest = Object.values(left).reduce((a, b) => a + b, 0);
  const mine = s.mine;

  async function claim() {
    if (!size) return;
    setBusy(true);
    if (await act('claimSinglet', { size }, 'Geclaimd: maat ' + size)) setSize('');
    setBusy(false);
  }

  return (
    <>
      <ErrorNote />
      <h1>Race singlet</h1>
      <p>De BenneKOM race singlet: topkwaliteit met gelaserde naden, zoals je ziet bij topmerken als SOAR, Bandit, On en Nike AeroSwift. Licht, strak en gemaakt om hard in te lopen.</p>

      <div className="shirt-product">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SINGLET.image} alt="Ontwerp van de BenneKOM race singlet, voor- en achterkant" />
      </div>

      <h2>Waarom deze singlet</h2>
      <div className="panel singlet-feature">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/club/singlet-naden.jpg" alt="Close-up van een gelaserde boord bij de schouder" />
        <div style={{ minWidth: 0 }}>
          <b>Gelaserde naden</b>
          <p className="small">Geen gestikte zomen bij de hals en armsgaten: de randen zijn met een laser gesneden en verlijmd. Plat, soepel en niets dat schuurt, ook niet na 42 km.</p>
          <span className="small muted">Voorbeeld van de afwerking</span>
        </div>
      </div>
      <div className="panel singlet-feature">
        <span className="singlet-weight" aria-hidden="true">&lt;100<small>gram</small></span>
        <div style={{ minWidth: 0 }}>
          <b>Je voelt hem niet</b>
          <p className="small">Onder de 100 gram. Zo licht dat je vergeet dat je hem aanhebt, en hij plakt niet als je zweet.</p>
        </div>
      </div>

      <div className="panel callout">
        <b>Eerste batch: {total} stuks</b>
        <p>Op is op. Claim je singlet in jouw maat, één per lid. Je betaalt pas als de singlets geleverd zijn en je de jouwe in handen hebt: dan krijg je een betaalverzoek van {euro(SINGLET.price)}.</p>
        <p className="small"><b>Pasvorm:</b> valt normaal, dus kies je gewone maat.</p>
        <p className="small muted">Dit is de eerste batch. Is er meer interesse, dan volgen er zeker nieuwe batches.</p>
        <div className="singlet-stock">
          {Object.entries(SINGLET.stock).map(([z, n]) => (
            <div key={z} className={'stock' + (left[z] === 0 ? ' out' : '')}>
              <b>{z}</b>
              <span className="small">{left[z] === 0 ? 'uitverkocht' : `nog ${left[z]} van ${n}`}</span>
              <span className="bar"><span style={{ width: `${(left[z] / n) * 100}%` }} /></span>
            </div>
          ))}
        </div>
        <span className="small muted">{rest === 0 ? 'Deze batch is helemaal geclaimd. Een volgende batch komt eraan.' : `Nog ${rest} van de ${total} beschikbaar.`}</span>
      </div>

      {s.ready === false ? (
        <p className="note">Claimen is nog niet ingesteld. Kom binnenkort terug.</p>
      ) : mine ? (
        <div className="panel shirt-row on">
          <b>✓ Jouw singlet: maat {mine.size}</b>
          <span className="small muted">{STATUS[mine.status] || mine.status}</span>
          {mine.status === 'geclaimd' && (
            <button className="btn" onClick={async () => { if (confirm('Weet je zeker dat je je claim wilt annuleren? Je singlet gaat dan naar een ander.')) await act('unclaimSinglet', {}, 'Claim geannuleerd'); }}>Claim annuleren</button>
          )}
        </div>
      ) : !data.me ? (
        <div className="panel">
          <b>Meld je aan om te claimen</b>
          <p className="small muted" style={{ margin: 0 }}>Zo weten we wie welke singlet krijgt.</p>
          <Link className="btn btn-gold" href="/profiel">Aanmelden</Link>
        </div>
      ) : rest > 0 && (
        <div className="panel">
          <div className="field"><span className="plbl">Kies je maat</span>
            <div className="sizes">{Object.keys(SINGLET.stock).map((z) => (
              <button type="button" key={z} disabled={left[z] === 0} className={'size' + (size === z ? ' sel' : '')} onClick={() => setSize(z)}>{z}</button>
            ))}</div>
          </div>
          <button className="btn btn-gold" disabled={!size || busy} onClick={claim}>{size ? `Claim maat ${size} · ${euro(SINGLET.price)}` : 'Claim mijn singlet'}</button>
        </div>
      )}

      {s.people?.length > 0 && (
        <div className="shirt-people">
          <span className="small muted">{s.people.length} {s.people.length === 1 ? 'loper heeft' : 'lopers hebben'} er al één</span>
          <People list={s.people} />
        </div>
      )}
    </>
  );
}
