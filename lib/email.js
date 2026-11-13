// E-mailadressen vergelijken zonder dat kleine verschillen een tweede account opleveren.
// Hoofdletters en spaties tellen niet mee, en bij Gmail ook niet de puntjes en een +toevoeging
// (aart.vs1992@gmail.com, AartVS1992@googlemail.com en aartvs1992+club@gmail.com zijn dezelfde inbox).
export function mailKey(email) {
  const m = String(email || '').trim().toLowerCase();
  const at = m.lastIndexOf('@');
  if (at < 1) return m;
  let user = m.slice(0, at), domain = m.slice(at + 1);
  if (domain === 'googlemail.com') domain = 'gmail.com';
  if (domain === 'gmail.com') user = user.split('+')[0].replace(/\./g, '');
  return user + '@' + domain;
}

// Het profiel bij dit e-mailadres. Staan er (per ongeluk) meerdere, dan altijd het oudste,
// zodat je overal op hetzelfde account uitkomt.
export function findByEmail(profiles, email) {
  const k = mailKey(email);
  if (!k) return null;
  const hits = profiles.filter((p) => p.email && mailKey(p.email) === k);
  hits.sort((a, b) => String(a.created_at || a.updated_at || '').localeCompare(String(b.created_at || b.updated_at || '')));
  return hits[0] || null;
}
