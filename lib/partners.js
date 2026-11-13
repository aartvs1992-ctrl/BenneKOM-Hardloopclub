// Banners van partners, gekoppeld aan de naam van de partner (zoals in Beheer ingevuld).
// Nieuwe banner: zet het plaatje in public/partners/ en voeg hier een regel toe.
const BANNERS = {
  thrive: { src: '/partners/thrive.jpg', alt: 'THRIVE — Beer that makes you better: Peak, Play en Unwind', w: 640, h: 147 },
};

export function partnerBanner(name = '') {
  return BANNERS[String(name).trim().toLowerCase()] || null;
}
