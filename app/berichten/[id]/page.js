'use client';
import Link from 'next/link';
import { use, useEffect, useRef, useState } from 'react';
import { Avatar, Loading, MemberSheet } from '@/components/ui';
import { useMessages, when } from '../useMessages';

export default function Gesprek({ params }) {
  const { id } = use(params);
  const { v, err, post } = useMessages(id, 6000);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [sheet, setSheet] = useState(false);
  const end = useRef(null);
  const n = v?.messages?.length || 0;
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [n]);

  if (err) return <p className="note">{err}</p>;
  if (!v) return <Loading />;
  if (v.notFound) return <><h1>Berichten</h1><p className="note">Dit lid bestaat niet (meer). <Link href="/berichten">Terug naar berichten</Link></p></>;
  const o = v.with;

  async function send(e) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    if (await post({ action: 'send', to: id, body: text })) setText('');
    setBusy(false);
  }

  return (
    <div className="dm">
      <button className="dm-head" onClick={() => setSheet(true)} aria-label={'Bekijk ' + o.name}>
        <Avatar name={o.name} src={o.avatar} size={40} /><b>{o.name}</b>
      </button>
      <div className="dm-msgs">
        {v.messages.length === 0 && <p className="muted small" style={{ textAlign: 'center' }}>Nog geen berichten. Zeg hallo!</p>}
        {v.messages.map((m, i) => (
          <div key={m.id || i} className={'bubble' + (m.mine ? ' mine' : '')}>
            <span>{m.body}</span><time>{when(m.at)}{m.mine && m.read && i === v.messages.length - 1 ? ' · gelezen' : ''}</time>
          </div>
        ))}
        <div ref={end} />
      </div>
      {!v.open ? (
        <div className="panel setrow" style={{ flexDirection: 'row' }}><span className="small">Zet berichten aan om {o.first || o.name} te berichten.</span>
          <button className="btn btn-gold btn-sm" onClick={() => post({ action: 'open', on: true })}>Aanzetten</button></div>
      ) : !o.open ? (
        <p className="note">{o.first || o.name} ontvangt geen berichten (meer).</p>
      ) : (
        <form className="dm-form" onSubmit={send}>
          <textarea className="input" rows={1} maxLength={1000} placeholder="Bericht" value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !('ontouchstart' in window)) send(e); }} />
          <button className="btn btn-gold" disabled={busy || !text.trim()} aria-label="Versturen">➤</button>
        </form>
      )}
      {sheet && <MemberSheet p={{ name: o.name, avatar: o.avatar }} onClose={() => setSheet(false)} />}
    </div>
  );
}
