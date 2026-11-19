'use client';
// Samen: wat we als club samen doen. Geen ranglijst: het gaat om wie er was, niet wie het snelst liep.
// Clubcijfers komen uit de app zelf; je Strava-cijfers zie alleen jij.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/AppProvider';
import { Loading, PhotoHeader } from '@/components/ui';

const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
const day = (iso) => { const d = new Date(iso + 'T12:00:00Z'); return `${d.toLocaleDateString('nl-NL', { weekday: 'long', timeZone: 'UTC' })} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`; };
const nl = (n) => Number(n || 0).toLocaleString('nl-NL');

function Fact({ icon, n, label }) {
  return (
    <div className="panel samen-fact">
      <span className="samen-ico" aria-hidden="true">{icon}</span>
      <b className="num">{n}</b>
      <span className="small muted">{label}</span>
    </div>
  );
}

export default function Samen() {
  const { local } = useApp();
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!local) return;
    fetch('/api/samen?device=' + encodeURIComponent(local.device), { cache: 'no-store' })
      .then((r) => r.json()).then(setD).catch(() => setErr('De gegevens konden niet worden geladen.'));
  }, [local]);

  if (!local || (!d && !err)) return <Loading />;
  if (err) return <p className="err">{err}</p>;
  const c = d.club;
  const me = d.me || {};
  const pct = c ? Math.min(100, Math.round((c.together / c.goal) * 100)) : 0;
  const diff = me.connected && !me.error ? Math.round((me.week.km - me.lastWeek.km) * 10) / 10 : 0;

  return (
    <>
      <PhotoHeader src="/club/pasta-run-zicht.jpg" title="Samen" sub="Niet wie het snelst liep, maar wie er was" pos="center 45%" />

      {c && (
        <>
          <section className="panel">
            <span className="eyebrow">Samen in {c.monthName}</span>
            <h2 style={{ margin: 0 }}><span className="num">{nl(c.together)}</span> keer erbij</h2>
            <div className="progress" aria-label={`${pct}% van het doel`}><span style={{ width: pct + '%' }} /></div>
            <p className="small muted" style={{ margin: 0 }}>
              {c.together >= c.goal ? `Doel van ${c.goal} gehaald. Wat een club!` : `Nog ${nl(c.goal - c.together)} tot ons doel van ${c.goal}. Elke training en elk event telt.`}
            </p>
          </section>

          {c.next && (
            <Link className="panel join-card" href="/agenda">
              <span style={{ minWidth: 0 }}>
                <span className="eyebrow">Volgende training</span><br />
                <b>{day(c.next.date)}</b><br />
                <span className="small muted">{c.next.n === 1 ? '1 loper is er al bij' : `${c.next.n} lopers zijn er al bij`}. Jij ook?</span>
              </span>
              <span className="chev">›</span>
            </Link>
          )}

          <div className="grid2">
            <Fact icon="👟" n={c.trainings} label={c.trainings === 1 ? 'training deze maand' : 'trainingen deze maand'} />
            <Fact icon="🙌" n={c.busiest ? c.busiest.n : '–'} label={c.busiest ? `drukste dinsdag (${day(c.busiest.date).split(' ').slice(1).join(' ')})` : 'drukste dinsdag'} />
            <Fact icon="👋" n={c.newMembers} label={c.newMembers === 1 ? 'nieuw lid deze maand' : 'nieuwe leden deze maand'} />
            <Fact icon="🚗" n={c.rides} label="carpools naar wedstrijden" />
          </div>
        </>
      )}

      <div className="section-head"><h2>Jouw maand</h2><span className="small muted">alleen voor jou</span></div>

      {!me.connected && (
        <section className="panel">
          <p style={{ margin: 0 }}>Koppel je Strava en zie hier je eigen week: je reeks, je kilometers en hoe vaak je de Grebbeberg op liep. Dit ziet niemand anders.</p>
          {me.configured && <a className="btn btn-strava" href={'/api/strava/connect?next=samen&device=' + encodeURIComponent(local.device)}>Koppel met Strava</a>}
        </section>
      )}

      {me.connected && me.error && <p className="err">{me.error}</p>}

      {me.connected && !me.error && (
        <>
          <section className="panel">
            <span className="eyebrow">Deze week</span>
            <h2 style={{ margin: 0 }}><span className="num">{me.week.runs}</span> {me.week.runs === 1 ? 'loopje' : 'loopjes'} · <span className="num">{nl(me.week.km)}</span> km</h2>
            <p className="small muted" style={{ margin: 0 }}>
              {me.streak > 1 ? `🔥 ${me.streak} weken op rij actief. ` : me.streak === 1 ? 'Deze week is je reeks begonnen. ' : ''}
              {diff > 0 ? `${nl(diff)} km meer dan vorige week.` : diff < 0 ? `Vorige week ${nl(me.lastWeek.km)} km. Rustig aan mag ook.` : ''}
            </p>
          </section>
          <div className="grid2">
            <Fact icon="⛰️" n={nl(me.month.grebbeberg) + '×'} label="de Grebbeberg op" />
            <Fact icon="🤝" n={me.month.group} label="loopjes samen met anderen" />
            <Fact icon="🌅" n={me.month.early} label="keer voor 7:00 op pad" />
            <Fact icon="🌙" n={me.month.late} label="keer na 21:00 op pad" />
          </div>
        </>
      )}

      <p className="proto">Clubcijfers komen uit de aanmeldingen in de app. Je Strava-gegevens zie alleen jij.</p>
    </>
  );
}
