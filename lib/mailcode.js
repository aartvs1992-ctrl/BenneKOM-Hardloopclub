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
      <img src="${base}/mail/groep.jpg" width="440" alt="Lopers van BenneKOM in de herfstlaan" style="display:block;width:100%;height:auto;border:0">
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
      <td style="width:64px;padding-top:16px;vertical-align:middle"><img src="${base}/mail/aart.jpg" width="56" height="56" alt="Aart" style="display:block;width:56px;height:56px;border-radius:50%;border:0"></td>
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
