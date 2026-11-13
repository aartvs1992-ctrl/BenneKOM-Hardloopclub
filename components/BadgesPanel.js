'use client';
// Badges in je eigen profiel: aantal, je nieuwste badges en de volgende om naartoe te werken
import Link from 'next/link';
import Badge from './Badge';
import { useBadges } from '@/lib/useBadges';
import { nextBadge } from '@/lib/badges';

export default function BadgesPanel() {
  const { state } = useBadges();
  if (!state) return <div className="skeleton" style={{ minHeight: 150 }} />;
  const earned = state.badges.filter((b) => b.earned).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const next = nextBadge(state.badges);
  return (
    <Link className="panel profile-badges" href="/badges">
      <div className="section-head">
        <h3>Mijn badges</h3>
        <span className="badge-count num" style={{ fontSize: 20 }}>{earned.length} / {state.badges.length}</span>
      </div>
      {earned.length
        ? <div className="row-badges">{earned.slice(0, 5).map((b) => <Badge key={b.id} b={b} size={58} />)}</div>
        : <p className="small muted">{state.connected ? 'Nog geen badges. Kom dinsdag naar de training, dan heb je je eerste!' : 'Koppel Strava of check in bij de training, dan verdien je je eerste badge.'}</p>}
      {next && (
        <div className="section" style={{ gap: 5 }}>
          <span className="small">Volgende: <b>{next.name}</b> · {next.have} van {next.need}{next.unit ? ' ' + next.unit : ''}</span>
          <span className="badge-bar"><i style={{ width: `${Math.round((next.have / next.need) * 100)}%` }} /></span>
        </div>
      )}
      <span className="link">Alle badges bekijken ›</span>
      <span className="small muted" style={{ marginTop: -6 }}>Alleen jij ziet je badges.</span>
    </Link>
  );
}
