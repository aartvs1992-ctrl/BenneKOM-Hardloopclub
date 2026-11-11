'use client';
// Betalen via de bunq.me-link: knop opent iDEAL met het juiste bedrag; daarna meldt het lid 'ik heb betaald'.
import { useApp } from './AppProvider';
import { euro, payLink } from '@/lib/content';

export default function PayBox({ amount, desc, paid, reported, report, note }) {
  const { act } = useApp();
  if (paid) return <span className="small" style={{ color: 'var(--ok, #2f8f4e)', fontWeight: 700 }}>✓ Betaald, dank je!</span>;
  return (
    <div className="paybox">
      {reported ? (
        <>
          <span className="small"><b>Je hebt aangegeven dat je betaald hebt.</b> Aart zet hem op betaald zodra het binnen is.</span>
          <button className="link-btn small" onClick={() => act('paidReport', { ...report, undo: true }, 'Teruggezet')}>Toch nog niet betaald?</button>
        </>
      ) : (
        <>
          {note && <span className="small muted">{note}</span>}
          <a className="btn btn-gold" href={payLink(amount, desc)} target="_blank" rel="noopener noreferrer">Betaal {euro(amount)} met iDEAL</a>
          <button className="btn btn-line btn-sm" onClick={() => act('paidReport', report, 'Top, Aart checkt het')}>Ik heb betaald</button>
        </>
      )}
    </div>
  );
}
