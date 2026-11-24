/** @type {import('next').NextConfig} */
const nextConfig = {
  env: { NEXT_PUBLIC_BUILD: process.env.VERCEL_GIT_COMMIT_SHA || 'dev' },
  // Verkleinde foto's via /_next/image (zie lib/img.js). Weinig vaste breedtes en lang bewaren,
  // zodat het ruim binnen het gratis Vercel-abonnement blijft.
  images: {
    imageSizes: [64, 128, 256, 384],
    deviceSizes: [640, 828, 1200],
    formats: ['image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 31,
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' }],
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        // clubfoto's, iconen en filmpjes veranderen zelden: een week in de browser bewaren
        source: '/:dir(club|icons|media|partners|routes)/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=2592000' }],
      },
    ];
  },
};

export default nextConfig;
