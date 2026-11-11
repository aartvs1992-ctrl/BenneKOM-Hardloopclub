'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Avatar, Loading, Switch } from '@/components/ui';
import { useMessages, when } from './useMessages';


export default function Berichten() {
  const { v, err, post } = useMessages(null, 15000);
  const [q, setQ] = useState('');
  const [picking, setPicking] = useState(false);
  if (err) return <><h1>Berichten</h1><p className="note">{err}</p></>;
  if (!v) return <Loading />;

  const list = v.members.filter((m) => m.name.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <>
      <h1>Berichten</h1>
      <div className="panel setrow" style={{ flexDirection: 'row' }}>
        <span><b>Berichten ontvangen</b><br /><span className="small muted">{v.open
          ? 'Clubgenoten die dit ook aan hebben staan, kunnen je een bericht sturen.'
          : 'Staat uit. Zet je dit aan, dan kun je clubgenoten berichten en zij jou. Alleen leden die het zelf aanzetten doen mee.'}</span></span>
        <Switch id="dm-open" checked={v.open} onChange={(on) => post({ action: 'open', on })} label="Berichten ontvangen" />
      </div>

      {v.open && (
        <section className="section">
          <div className="section-head"><h2>Gesprekken</h2><button className="link" style={{ background: 'none', border: 0, cursor: 'pointer' }} onClick={() => setPicking(!picking)}>{picking ? 'Sluiten' : 'Nieuw bericht ›'}</button></div>
          {picking && (
            <div className="panel dm-pick">
              <input className="input" placeholder="Zoek een clubgenoot" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
              {list.length ? (
                <div className="list">
                  {list.map((m) => (
                    <Link key={m.id} className="row dm-row" href={'/berichten/' + m.id}>
                      <Avatar name={m.name} src={m.avatar} size={40} /><span className="t">{m.name}</span><span className="chev">›</span>
                    </Link>
                  ))}
                </div>
              ) : <p className="small muted" style={{ margin: 0 }}>{v.members.length ? 'Niemand gevonden.' : 'Nog geen andere leden met berichten aan. Vertel het verder op de dinsdag!'}</p>}
            </div>
          )}
          {v.threads.length ? (
            <div className="list">
              {v.threads.map((t) => (
                <Link key={t.id} className={'row dm-row' + (t.unread ? ' unread' : '')} href={'/berichten/' + t.id}>
                  <Avatar name={t.name} src={t.avatar} size={44} />
                  <span style={{ minWidth: 0 }}><span className="t">{t.name}</span><br /><span className="s dm-last">{t.mineLast ? 'Jij: ' : ''}{t.last}</span></span>
                  <span className="dm-meta"><span className="small muted">{when(t.at)}</span>{t.unread > 0 && <span className="badge">{t.unread}</span>}</span>
                </Link>
              ))}
            </div>
          ) : !picking && <p className="muted">Nog geen berichten. Tik op <b>Nieuw bericht</b>, of op het gezicht van een clubgenoot bij een training.</p>}
        </section>
      )}
      {!v.open && v.threads.length > 0 && <p className="note">Je hebt nog {v.threads.length} {v.threads.length === 1 ? 'gesprek' : 'gesprekken'}. Zet berichten aan om ze weer te zien.</p>}
    </>
  );
}
