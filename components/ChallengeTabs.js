'use client';
import Link from 'next/link';
import { CS_ENABLED } from '@/lib/cs';

// Wisselen tussen de Challenges: de 5 km, de coopertest en de CS-test
export default function ChallengeTabs({ active }) {
  return (
    <nav className="seg seg-links" aria-label="Challenges">
      <Link href="/challenge" aria-current={active === '5km' ? 'page' : undefined}>5km Challenge</Link>
      <Link href="/challenge/cooper" aria-current={active === 'cooper' ? 'page' : undefined}>Coopertest</Link>
      {(CS_ENABLED || active === 'cs') && <Link href="/challenge/cs" aria-current={active === 'cs' ? 'page' : undefined}>CS-test</Link>}
    </nav>
  );
}
