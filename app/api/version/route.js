// Welke versie draait er live? Gebruikt om de app automatisch te verversen na een update.
export const dynamic = 'force-dynamic';
export function GET() {
  return Response.json({ v: process.env.NEXT_PUBLIC_BUILD || 'dev' }, { headers: { 'Cache-Control': 'no-store' } });
}
