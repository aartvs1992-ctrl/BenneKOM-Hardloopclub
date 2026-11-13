// Bevestigingscode per e-mail (via Resend). Zonder RESEND_API_KEY staat de bevestiging uit
// en meldt iemand zich direct aan, zodat de app blijft werken.
// De code wordt niet opgeslagen: de server geeft een ondertekend bewijs mee (token) met daarin
// het e-mailadres, een hash van de code en de vervaltijd. Bij het invullen controleert hij dat.
import crypto from 'crypto';

export const mailReady = Boolean(process.env.RESEND_API_KEY);
const FROM = process.env.MAIL_FROM || 'BenneKOM Hardloopclub <noreply@bennekomhardloopclub.app>';
const SECRET = process.env.AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VAPID_PRIVATE_KEY || 'bennekom-dev';
const TTL = 15 * 60 * 1000; // 15 minuten
const MAX_TRIES = 5;

const b64 = (s) => Buffer.from(s).toString('base64url');
const sign = (s) => crypto.createHmac('sha256', SECRET).update(s).digest('base64url');
const hashCode = (code, email) => crypto.createHmac('sha256', SECRET).update(email + ':' + code).digest('base64url');

export function makeCode(payload) {
  const code = String(crypto.randomInt(0, 1e6)).padStart(6, '0');
  const body = b64(JSON.stringify({ ...payload, h: hashCode(code, payload.email), exp: Date.now() + TTL }));
  return { code, token: body + '.' + sign(body) };
}

// pogingen per token (best effort; per serverinstantie)
const tries = globalThis.__bkTries || (globalThis.__bkTries = new Map());

export function checkCode(token, code) {
  const [body, sig] = String(token || '').split('.');
  if (!body || !sig || sign(body) !== sig) return { error: 'Deze code is niet meer geldig. Vraag een nieuwe aan.' };
  const p = JSON.parse(Buffer.from(body, 'base64url').toString());
  if (Date.now() > p.exp) return { error: 'De code is verlopen. Vraag een nieuwe aan.' };
  const n = (tries.get(sig) || 0) + 1;
  tries.set(sig, n);
  if (n > MAX_TRIES) return { error: 'Te vaak geprobeerd. Vraag een nieuwe code aan.' };
  const clean = String(code || '').replace(/\D/g, '');
  if (hashCode(clean, p.email) !== p.h) return { error: 'Deze code klopt niet. Kijk nog eens in je mail.' };
  tries.delete(sig);
  return { payload: p };
}

export async function sendCodeMail(to, code, first, origin = '') {
  const base = (process.env.APP_URL || origin || '').replace(/\/$/, '');
  const name = first ? String(first).replace(/[<>&]/g, '') : 'loper';
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:440px;margin:0 auto;padding:24px;color:#0B1B33">
    <div style="background:#071E3E;border-radius:14px;overflow:hidden;text-align:center">
      <img src="${base}/mail/groep-heel.jpg" width="440" alt="Lopers van BenneKOM in de herfstlaan" style="display:block;width:100%;height:auto;border:0">
      <div style="padding:16px 22px 18px">
        <div style="font-size:28px;font-weight:800;color:#fff">Benne<span style="color:#E2B74A">KOM</span></div>
        <div style="font-size:11px;letter-spacing:4px;color:#E2B74A;font-weight:700">HARDLOOPCLUB</div>
      </div>
    </div>
    <p style="font-size:16px">Hoi ${name},</p>
    <p style="font-size:16px">Je bevestigingscode voor de BenneKOM-app is:</p>
    <p style="font-size:34px;font-weight:800;letter-spacing:8px;text-align:center;margin:18px 0">${code}</p>
    <p style="font-size:14px;color:#5b6b80">Vul hem in de app in. De code is 15 minuten geldig. Heb je dit niet aangevraagd? Dan kun je deze mail negeren.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:22px;border-top:1px solid #e3e6ea;padding-top:16px;width:100%"><tr>
      <td style="width:64px;padding-top:16px;vertical-align:middle"><img src="${base}/mail/aart-camera.jpg" width="56" height="56" alt="Aart" style="display:block;width:56px;height:56px;border-radius:50%;border:0"></td>
      <td style="padding-top:16px;vertical-align:middle;font-size:14px;line-height:1.4"><b>Aart van Steenbergen</b><br><span style="color:#5b6b80">Oprichter BenneKOM Hardloopclub · Tot snel bij de training!</span></td>
    </tr></table>
  </div>`;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [to], subject: `${code} is je BenneKOM-code`, html, text: `Je BenneKOM-code is ${code}. Hij is 15 minuten geldig.` }),
  });
  if (!r.ok) throw new Error('mail ' + r.status + ' ' + (await r.text()).slice(0, 200));
}

// Korte mail van de club (bv. een herinnering). Met `event` krijgt hij de opmaak van de
// eventpagina in de app: sfeerfoto, label, grote titel en de vakjes datum / tijd / plaats.
export async function sendClubMail(to, { subject, first, lines, button, url, origin = '', event = null, signoff = 'Tot snel bij de training!' }) {
  const base = (process.env.APP_URL || origin || '').replace(/\/$/, '');
  const esc = (t) => String(t || '').replace(/[<>&]/g, '');
  const link = url ? base + url : base;
  const DISPLAY = "'Barlow Condensed','Arial Narrow',Arial,sans-serif";
  const BODY = "Barlow,Arial,Helvetica,sans-serif";
  const MONO = "'JetBrains Mono',Menlo,Consolas,monospace";
  const img = (src) => (/^https?:/.test(src) ? src : base + src);
  const head = event ? `
    ${event.image ? `<img src="${img(event.image)}" width="440" alt="" style="display:block;width:100%;height:auto;border:0;border-radius:14px">` : ''}
    <div style="margin-top:20px">
      ${event.tag ? `<span style="display:inline-block;font-family:${MONO};font-size:10px;letter-spacing:.08em;text-transform:uppercase;padding:3px 7px;border-radius:5px;background:#C99A1E;color:#071E3E;font-weight:700">${esc(event.tag)}</span>` : ''}
      ${event.when ? `<span style="font-family:${MONO};font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#5B6880;margin-left:6px">${esc(event.when)}</span>` : ''}
    </div>
    <div style="font-family:${DISPLAY};font-size:40px;font-weight:800;text-transform:uppercase;line-height:1.05;margin:8px 0 14px;color:#0B1B33">${esc(event.title)}</div>
    ${event.facts?.length ? `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:separate;border-spacing:6px 0;margin:0 -6px"><tr>
      ${event.facts.map(([lbl, val]) => `<td style="background:#E8ECF3;border-radius:10px;padding:10px;vertical-align:top;width:${Math.floor(100 / event.facts.length)}%">
        <div style="font-size:12px;color:#5B6880">${esc(lbl)}</div>
        <div style="font-family:${MONO};font-weight:700;font-size:15px;color:#0B1B33;margin-top:2px">${esc(val)}</div></td>`).join('')}
    </tr></table>` : ''}
    ${event.chips?.length ? `<div style="margin-top:14px">${event.chips.map((c) => `<span style="display:inline-block;border:1.5px solid #DCE1EA;background:#fff;border-radius:999px;padding:7px 14px;font-weight:600;font-size:14px;margin:0 6px 6px 0;color:#0B1B33">${esc(c)}</span>`).join('')}</div>` : ''}` : `
    <div style="background:#071E3E;border-radius:14px;padding:16px 22px 18px;text-align:center">
      <div style="font-size:28px;font-weight:800;color:#fff">Benne<span style="color:#E2B74A">KOM</span></div>
      <div style="font-size:11px;letter-spacing:4px;color:#E2B74A;font-weight:700">HARDLOOPCLUB</div>
    </div>`;
  // Blauwe balk met het logo, zoals bovenin de app. Tabel met bgcolor, zodat ook Gmail de kleur toont.
  const bar = event ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#071E3E" style="background:#071E3E;border-radius:16px 16px 0 0"><tr>
      <td bgcolor="#071E3E" style="background:#071E3E;padding:16px 20px;border-radius:16px 16px 0 0;font-family:${DISPLAY};font-weight:800;font-size:26px;line-height:1;color:#F4F1E6">Benne<span style="color:#E2B74A">KOM</span></td>
    </tr></table>` : '';
  const html = `
  <div style="background:#F2F4F8;padding:16px 0">
  <div style="max-width:440px;margin:0 auto">${bar}
  <div style="font-family:${BODY};padding:20px;background:#fff;border-radius:${event ? '0 0 16px 16px' : '16px'};color:#0B1B33;line-height:1.45">
    ${head}
    <p style="font-size:17px;font-weight:500;margin:20px 0 0">Hoi ${esc(first) || 'loper'},</p>
    ${lines.map((l) => `<p style="font-size:16px;margin:12px 0 0">${esc(l)}</p>`).join('')}
    ${button ? `<p style="margin:22px 0 4px"><a href="${link}" style="background:#C99A1E;color:#071E3E;font-weight:700;font-size:15px;text-decoration:none;padding:13px 24px;border-radius:999px;display:inline-block">${esc(button)} ›</a></p>` : ''}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:22px;border-top:1px solid #DCE1EA;width:100%"><tr>
      <td style="width:60px;padding-top:16px;vertical-align:middle"><img src="${base}/mail/aart-camera.jpg" width="48" height="48" alt="Aart" style="display:block;width:48px;height:48px;border-radius:50%;border:0"></td>
      <td style="padding-top:16px;vertical-align:middle;font-size:14px;line-height:1.4"><b>Aart van Steenbergen</b><br><span style="color:#5B6880">Oprichter BenneKOM Hardloopclub · ${esc(signoff)}</span></td>
    </tr></table>
  </div></div></div>`;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [to], subject, html, text: `Hoi ${first || 'loper'},\n\n${lines.join('\n\n')}\n\n${link}\n\nGroet, Aart` }),
  });
  if (!r.ok) throw new Error('mail ' + r.status + ' ' + (await r.text()).slice(0, 200));
}
