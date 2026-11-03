'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from './AppProvider';
import { Avatar } from './ui';
import Welcome from './Welcome';

// Pagina's die ook zonder aanmelding open zijn
const OPEN = ['/beheer'];

const TABS = [
  ['/', 'Home', <path key="h" d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />],
  ['/agenda', 'Agenda', <g key="a"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></g>],
  ['/fotos', "Foto's", <g key="f"><rect x="3" y="5" width="18" height="15" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-9 9" /></g>],
  ['/meer', 'Meer', <path key="m" d="M4 6h16M4 12h16M4 18h16" />],
];

// Welke tab licht op bij subpagina's
function activeTab(path) {
  if (path === '/') return '/';
  if (path.startsWith('/agenda') || path.startsWith('/event')) return '/agenda';
  if (path.startsWith('/challenge')) return '/meer';
  if (path.startsWith('/fotos')) return '/fotos';
  return '/meer';
}

export default function Shell({ children }) {
  const path = usePathname();
  const router = useRouter();
  const tab = activeTab(path);
  const isRoot = TABS.some(([href]) => href === path);
  const { data } = useApp();
  const me = data?.me;

  // Nog niet aangemeld: eerst het beginscherm, daarna de hele app
  if (data && !me && !OPEN.some((p) => path.startsWith(p))) return <Welcome />;

  return (
    <>
      <header className="top">
        <div className="wrap">
          {!isRoot && (
            <button className="back" aria-label="Terug" onClick={() => (history.length > 1 ? router.back() : router.push('/'))}>‹</button>
          )}
          <Link className="brand" href="/">Benne<b>KOM</b></Link>
          <Link className="me-link" href="/profiel" aria-label={me ? 'Mijn profiel' : 'Profiel aanmaken'}>
            {me ? <><span>{me.first}</span><Avatar name={me.name} src={me.avatar} size={32} /></> : <span className="sub" style={{ marginLeft: 0 }}>Profiel aanmaken ›</span>}
          </Link>
        </div>
      </header>
      <main className="wrap"><div className="view">{children}</div></main>
      <nav className="tabbar" aria-label="Hoofdmenu">
        <div className="in">
          {TABS.map(([href, label, icon]) => (
            <Link key={href} href={href} aria-current={tab === href ? 'page' : undefined}>
              <svg viewBox="0 0 24 24" aria-hidden="true">{icon}</svg>
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
