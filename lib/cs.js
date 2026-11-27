// CS-test (Critical Speed): 3 minuten all-out, 15–20 minuten pauze, dan 12 minuten all-out.
// Uit de twee afstanden volgen je Critical Speed (CS) en je D' (je 'anaerobe reserve' in meters):
//   CS = (d12 − d3) / (720 − 180)        D' = d3 − CS × 180
// De 12 minuten loop je na maar 15–20 minuten pauze. Daardoor is hij gemiddeld 0,5–1% korter dan fris;
// we tellen het midden daarvan (0,75%) bij je 12-minutenafstand op.

export const CS_FATIGUE = 0.0075;

// Threshold ligt rond 91% van je CS-snelheid. Dat sluit aan op de Bakken-drempel uit de coopertest
// (2% rustiger dan Daniels' T-tempo), zodat beide tests vergelijkbare tempo's geven.
export const CS_THRESHOLD = 0.91;

const pace = (speed) => 1000 / speed; // m/s → sec/km

export function csCalc(d3, d12) {
  const d12c = d12 * (1 + CS_FATIGUE);
  const cs = (d12c - d3) / 540; // m/s
  const dPrime = d3 - cs * 180; // meter
  const ok = cs > 0 && dPrime > 0 && d12c > d3 * 2;
  return { d12c, cs, dPrime, ok, csPace: ok ? pace(cs) : null };
}

// Voorspelde tijd (sec) met het CS-model: zo lang hou je het vol met je CS plus je D'.
const csTime = (c, meters) => (meters - c.dPrime) / c.cs;

// Alle tempo's uit één CS-test (sec/km)
export function csPaces(d3, d12) {
  const c = csCalc(d3, d12);
  if (!c.ok) return { ...c };
  const B = c.csPace / CS_THRESHOLD; // drempeltempo
  const t5 = csTime(c, 5000);
  // Boven ~30 minuten is het CS-model te optimistisch; de 10 km voorspellen we uit je 5 km (Riegel, exponent 1,06)
  const t10 = t5 * Math.pow(2, 1.06);
  const p1500 = csTime(c, 1500) / 1.5;
  return {
    ...c,
    threshold: [B, B * 1.02], // herhalingen van 1–4 min
    subthreshold: [B * 1.02, B * 1.05], // blokken van 5–10 min
    // Easy: liever te rustig dan te hard. Ruim onder je LT1, rustiger mag altijd
    easy: [B * 1.35, B * 1.65],
    // LT1 (aerobe drempel): een schatting op 80–84% van je CS-snelheid. De bovengrens van je duurlopen
    lt1: [pace(c.cs * 0.84), pace(c.cs * 0.8)],
    vo2max: [pace(c.cs * 1.04), pace(c.cs * 1.01)], // 101–104% van je CS-snelheid
    strides: [p1500 * 0.97, p1500],
    races: [{ meters: 5000, time: t5, pace: t5 / 5 }, { meters: 10000, time: t10, pace: t10 / 10 }],
  };
}

export const CS_INFO = {
  title: 'Twee inspanningen, één grens',
  text: 'De CS-test meet je Critical Speed: het snelste tempo dat je lang kunt volhouden voordat je verzuurt en stilvalt. Je loopt eerst 3 minuten all-out, dan 15 tot 20 minuten rustig wandelen of dribbelen, en dan 12 minuten all-out. Uit het verschil tussen die twee afstanden rekenen we je CS uit, en daaruit je tempo\'s. Dat is preciezer dan de coopertest, omdat je snelheid en uithoudingsvermogen apart worden gemeten. Loop op een vlak stuk, liefst een atletiekbaan, en vul de afstanden van je horloge in.',
};
