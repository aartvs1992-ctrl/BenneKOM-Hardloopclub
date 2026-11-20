// Compacte verzending van de app-gegevens.
// Dezelfde persoon (naam, profielfoto, profielvragen) komt op veel plekken terug: bij elke training
// waar iemand bij was, bij carpools, shirts en singlets. In plaats van dat profiel tientallen keren mee
// te sturen, staat het één keer in `people` en verwijzen de andere plekken ernaar met { $p: nummer }.
// De app pakt dit bij ontvangst weer uit, zodat alle schermen precies dezelfde gegevens zien als voorheen.

export const PACK_HEADER = 'x-bk-pack';

// Server: vervangt elk object uit `isPerson` door een verwijzing naar de lijst `people`.
export function pack(state, isPerson) {
  const people = [];
  const index = new Map();
  const walk = (v) => {
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === 'object') {
      if (isPerson(v)) {
        let i = index.get(v);
        if (i === undefined) { i = people.length; people.push(v); index.set(v, i); }
        return { $p: i };
      }
      const out = {};
      for (const [k, x] of Object.entries(v)) out[k] = walk(x);
      return out;
    }
    return v;
  };
  const packed = walk(state);
  packed.$people = people;
  return packed;
}

// App: zet de verwijzingen terug naar volledige personen. Oude (niet-compacte) gegevens blijven ongewijzigd.
export function unpack(state) {
  if (!state || !Array.isArray(state.$people)) return state;
  const people = state.$people;
  const walk = (v) => {
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === 'object') {
      if (typeof v.$p === 'number' && Object.keys(v).length === 1) return { ...people[v.$p] };
      const out = {};
      for (const [k, x] of Object.entries(v)) out[k] = walk(x);
      return out;
    }
    return v;
  };
  const { $people, ...rest } = state;
  return walk(rest);
}
