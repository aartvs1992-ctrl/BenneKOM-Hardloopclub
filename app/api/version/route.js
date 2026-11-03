// Welke versie draait er live? Gebruikt om de app automatisch te verversen na een update.
export const dynamic = 'force-dynamic';
export function GET() {
  const v = process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_BUILD || 'dev';
  return Response.json({ v }, { headers: { 'Cache-Control': 'no-store' } });
}
