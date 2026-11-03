import Link from 'next/link';
import { CLUB } from '@/lib/club';
import { PhotoHeader, Avatar } from '@/components/ui';

export const metadata = { title: 'Fysiotherapeut · BenneKOM' };

export default function Fysio() {
  const f = CLUB.physio;
  const tel = f.phone.replace(/[^\d+]/g, '');
  return (
    <>
      <PhotoHeader src="/club/rekken-na-afloop.jpg" title="Pijntje of blessure?" sub="Loop er niet mee door: hoe eerder je aan de bel trekt, hoe sneller je weer meeloopt." pos="center 40%" />

      <div className="panel host-card">
        {f.photo
          ? /* eslint-disable-next-line @next/next/no-img-element */ <img className="host-photo" src={f.photo} alt={f.name} />
          : <Avatar name={f.name} size={84} />}
        <div style={{ minWidth: 0 }}>
          <b className="host-name">{f.name}</b>
          <span className="eyebrow">{f.role}{f.practice && ' · ' + f.practice}</span>
          <p>Heb je last van een pijntje of een blessure? Neem contact op met David. Hij kijkt wat er aan de hand is en helpt je weer op weg.</p>
        </div>
      </div>

      {(f.phone || f.email || f.url) ? (
        <div className="panel">
          <h3>Contact</h3>
          {f.phone && <div><span className="plbl">Telefoon</span><p className="num" style={{ userSelect: 'all' }}>{f.phone}</p><a className="btn btn-gold btn-sm" href={'tel:' + tel}>Bellen</a></div>}
          {f.email && <div><span className="plbl">E-mail</span><p style={{ userSelect: 'all' }}>{f.email}</p></div>}
          {f.url && <a className="link" href={f.url} target="_blank" rel="noopener noreferrer">Website van de praktijk ↗</a>}
        </div>
      ) : <p className="note">Contactgegevens volgen.</p>}

      <section className="section">
        <h2>Wanneer bel je?</h2>
        <ul className="bring">
          <li>Pijn die na een paar dagen rust niet minder wordt</li>
          <li>Pijn die tijdens het lopen erger wordt, of waardoor je anders gaat lopen</li>
          <li>Zwelling, of pijn op één vast punt op het bot (bijvoorbeeld scheenbeen of voet)</li>
          <li>Een blessure die steeds terugkomt</li>
        </ul>
        <p className="small muted">Twijfel je? Liever één keer te vroeg gebeld dan weken uit de roulatie. Bij een acuut letsel of hevige pijn ga je naar je huisarts of de huisartsenpost.</p>
      </section>

      <Link className="link" href="/meer">Terug naar Meer ›</Link>
    </>
  );
}
