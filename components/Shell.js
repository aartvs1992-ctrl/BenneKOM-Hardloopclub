'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const TABS = [
  ['/', 'Home', <path key="h" d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />],
  ['/agenda', 'Agenda', <g key="a"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></g>],
  ['/challenge', '5km', <g key="c"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" /><path d="M17 6h3a3 3 0 0 1-3 4M7 6H4a3 3 0 0 0 3 4" /></g>],
  ['/fotos', "Foto's", <g key="f"><rect x="3" y="5" width="18" height="15" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-9 9" /></g>],
  ['/meer', 'Meer', <path key="m" d="M4 6h16M4 12h16M4 18h16" />],
];

// Welke tab licht op bij subpagina's
function activeTab(path) {
  if (path === '/') return '/';
  if (path.startsWith('/agenda') || path.startsWith('/event')) return '/agenda';
  if (path.startsWith('/challenge')) return '/challenge';
  if (path.startsWith('/fotos')) return '/fotos';
  return '/meer';
}

export default function Shell({ children }) {
  const path = usePathname();
  const router = useRouter();
  const tab = activeTab(path);
  const isRoot = TABS.some(([href]) => href === path);

  return (
    <>
      <header className="top">
        <div className="wrap">
          {!isRoot && (
            <button className="back" aria-label="Terug" onClick={() => (history.length > 1 ? router.back() : router.push('/'))}>‹</button>
          )}
          <Link className="brand" href="/">Benne<b>KOM</b></Link>
          <span className="sub">Samen=leuker</span>
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
