// "Zet in mijn agenda": één evenement als agendabestand (.ics). Werkt met iPhone, Android/Google en Outlook.
import { buildState } from '@/lib/state';

export const dynamic = 'force-dynamic';

// Hoe lang iets ongeveer duurt (minuten), als er een starttijd is
const DURATION = { training: 75, challenge: 90, samenloop: 90, special: 150, wedstrijd: 180 };

const esc = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');
// Lange regels vouwen (max 75 tekens per regel volgens de standaard)
const fold = (line) => {
  const out = [];
  let rest = line;
  while (rest.length > 74) { out.push(rest.slice(0, 74)); rest = ' ' + rest.slice(74); }
  out.push(rest);
  return out.join('\r\n');
};
const stamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

// Lokale tijd in Nederland → UTC (rekening houdend met zomer- en wintertijd)
function amsterdamToUtc(date, time) {
  const guess = new Date(`${date}T${time}:00Z`);
  const local = new Date(guess.toLocaleString('en-US', { timeZone: 'Europe/Amsterdam' }));
  const utcView = new Date(guess.toLocaleString('en-US', { timeZone: 'UTC' }));
  return new Date(guess.getTime() - (local - utcView));
}

export async function GET(req, { params }) {
  const { id } = await params;
  const state = await buildState('').catch(() => null);
  const e = state?.events?.find((x) => x.id === id);
  if (!e) return new Response('Dit evenement bestaat niet (meer).', { status: 404 });

  const origin = new URL(req.url).origin;
  const link = `${origin}/event/${encodeURIComponent(e.id)}`;
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Hardloopclub BenneKOM//App//NL', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
    `UID:${e.id}@bennekom-app`, `DTSTAMP:${stamp(new Date())}`];
  if (/^\d{1,2}:\d{2}$/.test(e.time || '')) {
    const start = amsterdamToUtc(e.date, e.time.padStart(5, '0'));
    const end = new Date(start.getTime() + (DURATION[e.type] || 90) * 60e3);
    lines.push(`DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`);
  } else {
    // nog geen tijd: hele dag
    const next = new Date(e.date + 'T12:00:00Z'); next.setUTCDate(next.getUTCDate() + 1);
    lines.push(`DTSTART;VALUE=DATE:${e.date.replace(/-/g, '')}`, `DTEND;VALUE=DATE:${next.toISOString().slice(0, 10).replace(/-/g, '')}`);
  }
  const about = [e.description, e.distances && `Afstanden: ${e.distances}`, !e.time && 'Tijd volgt: kijk in de app.', `Meer info en aanmelden: ${link}`].filter(Boolean).join('\n\n');
  lines.push(
    `SUMMARY:${esc(e.type === 'wedstrijd' || /bennekom/i.test(e.title || '') ? e.title : `BenneKOM · ${e.title || 'Clubtraining'}`)}`,
    `LOCATION:${esc(e.place)}`,
    `DESCRIPTION:${esc(about)}`,
    `URL:${link}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Herinnering', 'TRIGGER:-PT2H', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR');

  const file = e.id.replace(/[^a-z0-9-]/gi, '') + '.ics';
  return new Response(lines.map(fold).join('\r\n') + '\r\n', {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': `inline; filename="${file}"`, 'Cache-Control': 'no-store' },
  });
}
