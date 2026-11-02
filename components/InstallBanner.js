'use client';
import { useEffect, useState } from 'react';

// Laat zien hoe je de app op je beginscherm zet (verdwijnt als hij al geïnstalleerd is)
export default function InstallBanner() {
  const [mode, setMode] = useState(null); // 'android' | 'ios' | null
  const [prompt, setPrompt] = useState(null);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    let dismissed = false;
    try { dismissed = localStorage.getItem('bk-install-dismissed') === '1'; } catch {}
    if (standalone || dismissed) return;
    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) setMode('ios');
    const onPrompt = (e) => { e.preventDefault(); setPrompt(e); setMode('android'); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (!mode) return null;
  const close = () => { try { localStorage.setItem('bk-install-dismissed', '1'); } catch {} setMode(null); };

  return (
    <div className="banner">
      {mode === 'ios'
        ? <span>Zet BenneKOM op je beginscherm: tik op <b>Deel</b> en kies <b>Zet op beginscherm</b>.</span>
        : <span>Zet BenneKOM als app op je telefoon.</span>}
      {mode === 'android'
        ? <button onClick={async () => { prompt.prompt(); await prompt.userChoice; close(); }}>Installeren</button>
        : <button onClick={close} aria-label="Sluiten">OK</button>}
    </div>
  );
}
