'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import { Avatar, Loading, MemberSheet, QUESTIONS } from '@/components/ui';

const cache = { list: null };
const answered = (p) => QUESTIONS.filter(([k]) => p[k]).length;

// Clubgenoten: alle profielen; tik op iemand voor foto, antwoorden en badges
export default function Leden() {
  const { local } = useApp();
  const [list, setList] = useState(cache.list);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);

  useEffect(() => {
    if (!local?.device) return;
    fetch('/api/leden?device=' + encodeURIComponent(local.device), { cache: 'no-store' })
      .then(async (r) => { const j = await r.json(); if (!r.ok) throw new Error(j.error); cache.list = j.members; setList(j.members); })
      .catch((e) => setErr(e.message || 'Laden lukte niet.'));
  }, [local?.device]);

  if (err) return <><h1>Clubgenoten</h1><p className="note">{err} <Link href="/profiel">Naar je profiel ›</Link></p></>;
  if (!list) return <Loading />;
  const me = list.find((p) => p.me);
  const shown = list.filter((p) => p.name.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <>
      <h1>Clubgenoten</h1>
      <p className="muted" style={{ marginTop: -6 }}>{list.length} lopers met een profiel. Tik op iemand voor zijn of haar antwoorden en badges.</p>
      {me && answered(me) < 3 && (
        <Link className="panel join-card" href="/profiel">
          <Avatar name={me.name} src={me.avatar} size={48} />
          <span style={{ minWidth: 0 }}><b>Laat je ook zien</b><br /><span className="small muted">{me.avatar ? '' : 'Voeg een foto toe en '}vul de vragen in, dan leren clubgenoten je kennen.</span></span>
          <span className="chev">›</span>
        </Link>
      )}
      <input className="input" placeholder="Zoek een clubgenoot" value={q} onChange={(e) => setQ(e.target.value)} />
      <ul className="member-grid">
        {shown.map((p) => (
          <li key={p.bh || 'me'}>
            <button type="button" onClick={() => setOpen(p)} aria-label={'Bekijk ' + p.name}>
              <Avatar name={p.name} src={p.avatar} size={84} />
              <b>{p.me ? 'Jij' : (p.first || p.name.split(' ')[0])}</b>
              <span className="small muted">{answered(p) ? `${answered(p)} ${answered(p) === 1 ? 'antwoord' : 'antwoorden'}` : ' '}</span>
            </button>
          </li>
        ))}
      </ul>
      {!shown.length && <p className="small muted">Niemand gevonden.</p>}
      {open && <MemberSheet p={open} onClose={() => setOpen(null)} />}
    </>
  );
}
