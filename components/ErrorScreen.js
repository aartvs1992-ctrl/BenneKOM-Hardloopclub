'use client';
// Vangnet als er iets misgaat. Meestal komt dat door een update terwijl de app nog openstond:
// dan laden we één keer automatisch opnieuw. Lukt dat niet, dan een nette melding met een knop.
import { useEffect, useState } from 'react';

const KEY = 'bk-error-reload';

export default function ErrorScreen({ error }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let last = 0;
    try { last = +sessionStorage.getItem(KEY) || 0; } catch {}
    if (Date.now() - last > 30000) {
      try { sessionStorage.setItem(KEY, String(Date.now())); } catch {}
      location.reload();
      return;
    }
    setShow(true);
    if (error) console.error(error);
  }, [error]);
  if (!show) return null;
  return (
    <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', maxWidth: 360 }}>
        <b style={{ fontSize: 18 }}>Oeps, er ging iets mis</b>
        <span className="small muted">Waarschijnlijk is de app net bijgewerkt. Laad hem opnieuw, dan werkt alles weer.</span>
        <button className="btn btn-gold" onClick={() => location.assign('/')}>Opnieuw laden</button>
        {error?.message && <code className="small muted" style={{ fontSize: 11, wordBreak: 'break-word' }}>{String(error.message).slice(0, 200)}{error.digest ? ' · ' + error.digest : ''}</code>}
      </div>
    </div>
  );
}
