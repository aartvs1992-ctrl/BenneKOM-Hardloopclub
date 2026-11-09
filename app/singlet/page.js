'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import { Loading, ErrorNote, useReady, People } from '@/components/ui';
import { SINGLET, euro } from '@/lib/content';

const STATUS = { geclaimd: 'Geclaimd · je krijgt een betaalverzoek', betaald: 'Betaald · je hoort wanneer je hem kunt ophalen', opgehaald: 'Opgehaald · veel plezier ermee!' };

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
      <p>De BenneKOM race singlet: topkwaliteit met gelaserde naden, zoals je ziet bij SOAR, Bandit en On. Licht, strak en gemaakt om hard in te lopen.</p>

      <div className="shirt-product">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SINGLET.image} alt="Ontwerp van de BenneKOM race singlet, voor- en achterkant" />
      </div>

      <div className="panel callout">
        <b>Beperkte oplage: {total} stuks</b>
        <p>Op is op. Claim je singlet in jouw maat; daarna krijg je een betaalverzoek van {euro(SINGLET.price)}. Eén singlet per lid.</p>
        <div className="singlet-stock">
          {Object.entries(SINGLET.stock).map(([z, n]) => (
            <div key={z} className={'stock' + (left[z] === 0 ? ' out' : '')}>
              <b>{z}</b>
              <span className="small">{left[z] === 0 ? 'uitverkocht' : `nog ${left[z]} van ${n}`}</span>
              <span className="bar"><span style={{ width: `${(left[z] / n) * 100}%` }} /></span>
            </div>
          ))}
        </div>
        <span className="small muted">{rest === 0 ? 'Alle singlets zijn geclaimd.' : `Nog ${rest} van de ${total} beschikbaar.`}</span>
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
