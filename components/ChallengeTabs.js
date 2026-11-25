'use client';
import Link from 'next/link';

// Wisselen tussen de Challenges: de 5 km en de coopertest
export default function ChallengeTabs({ active }) {
  return (
    <nav className="seg seg-links" aria-label="Challenges">
      <Link href="/challenge" aria-current={active === '5km' ? 'page' : undefined}>5km Challenge</Link>
      <Link href="/challenge/cooper" aria-current={active === 'cooper' ? 'page' : undefined}>Coopertest</Link>
    </nav>
  );
}
