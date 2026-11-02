// Recente activiteiten van de Strava-club. Strava geeft bij clubactiviteiten alleen
// voornaam + initiaal, afstand, tijd en naam van de activiteit (geen datum of kaart).
export const revalidate = 600; // tien minuten cachen

export async function GET() {
  const { STRAVA_CLIENT_ID: id, STRAVA_CLIENT_SECRET: secret, STRAVA_REFRESH_TOKEN: refresh } = process.env;
  const club = process.env.STRAVA_CLUB_ID || '1629265';
  if (!id || !secret || !refresh) return Response.json({ configured: false, activities: [] });
  try {
    const tok = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: id, client_secret: secret, refresh_token: refresh, grant_type: 'refresh_token' }),
      cache: 'no-store',
    }).then((r) => r.json());
    if (!tok.access_token) throw new Error('geen token');
    const acts = await fetch(`https://www.strava.com/api/v3/clubs/${club}/activities?per_page=30`, {
      headers: { Authorization: `Bearer ${tok.access_token}` },
      next: { revalidate: 600 },
    }).then((r) => r.json());
    const activities = (Array.isArray(acts) ? acts : [])
      .filter((a) => /run/i.test(a.sport_type || a.type || ''))
      .map((a) => ({
        name: a.name,
        athlete: `${a.athlete?.firstname || ''} ${a.athlete?.lastname || ''}`.trim(),
        km: Math.round((a.distance / 1000) * 10) / 10,
        seconds: a.moving_time,
      }));
    return Response.json({ configured: true, activities });
  } catch {
    return Response.json({ configured: true, activities: [], error: 'Strava is even niet bereikbaar.' });
  }
}
