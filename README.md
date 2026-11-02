# BenneKOM app

De app van Hardloopclub BenneKOM. Leden zetten hem op hun beginscherm en krijgen:

- **Agenda** met dinsdagtrainingen (automatisch), specials, wedstrijden en de 5km Challenge
- **Ik ben erbij** bij trainingen, met teller
- **Profielen**: naam, profielfoto (zelf inzoomen en verschuiven) en vier kennismakingsvragen; tik op een gezicht voor de ledenkaart; gezichten bij aanmeldingen, inschrijvingen en carpool. Met een herstelcode open je je profiel op een ander toestel.
- **Inschrijven** met één tik (of op naam zonder profiel), met optioneel maximum
- **Carpool** bij wedstrijden: rit aanbieden of meerijden
- **Jouw 5 km**: persoonlijke pagina voor de 5km Challenge — tijden op het Strava-segment komen automatisch binnen (of zelf invullen), met PR, verschil met de vorige keer en een grafiek. Alleen zichtbaar voor het lid zelf.
- **Calculator** (tempo, voorspeller, hartslagzones, splits) en **voedingsplan**
- **Leren**: 15 modules met voortgang
- **Nieuws** van de club
- **Fotowall**: leden plaatsen foto's, geven duimpjes; beheer kan uitlichten en verwijderen
- **Pushmeldingen**: dinsdagherinnering, nieuwe events, Challenge, carpool
- **Beheer** (`/beheer`): events, nieuws, voorstellen, tijden en meldingen versturen

Gebouwd met Next.js, Supabase (database) en Vercel (hosting). Alles past binnen de gratis abonnementen.

---

## Online zetten — stap voor stap

### 1. Database (Supabase)
1. Ga naar [supabase.com](https://supabase.com) en log in met GitHub.
2. Klik **New project**. Naam: `bennekom`. Kies regio **West EU**. Bewaar het databasewachtwoord.
3. Ga naar **SQL Editor → New query**, plak de inhoud van [`supabase/schema.sql`](supabase/schema.sql) en klik **Run**. Doe daarna hetzelfde met [`supabase/002_fotowall.sql`](supabase/002_fotowall.sql) [`supabase/003_strava.sql`](supabase/003_strava.sql) , [`supabase/004_profielen.sql`](supabase/004_profielen.sql) en [`supabase/005_profielvragen.sql`](supabase/005_profielvragen.sql).
4. Ga naar **Project Settings → API** en noteer de **Project URL** en de **service_role**-sleutel (geheim houden).

### 2. Pushmeldingen (sleutels)
Laat Claude dit doen, of draai `npx web-push generate-vapid-keys`. Je krijgt een *public key* en een *private key*.

### 3. App online (Vercel)
1. Ga naar [vercel.com](https://vercel.com) en log in met GitHub.
2. **Add New → Project** → kies `BenneKOM-Hardloopclub` → **Import**.
3. Open **Environment Variables** en vul in (zie ook `.env.example`):

| Naam | Waarde |
|---|---|
| `SUPABASE_URL` | Project URL uit stap 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role-sleutel uit stap 1 |
| `ADMIN_PASSWORD` | zelfgekozen wachtwoord voor `/beheer` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | public key uit stap 2 |
| `VAPID_PRIVATE_KEY` | private key uit stap 2 |
| `CRON_SECRET` | willekeurige lange tekst |

4. Klik **Deploy**. Na een minuut staat de app op `bennekom-hardloopclub.vercel.app`.
5. Optioneel: koppel een eigen adres, bijvoorbeeld `app.hardloopclubbennekom.nl`, via **Settings → Domains**.

Elke dag om 16:00 (winter) of 17:00 (zomer) kijkt de app of er die dag een training is of morgen een Challenge, en stuurt dan een melding (`vercel.json`).

### 4. Strava (persoonlijke 5km Challenge)
1. Ga naar [strava.com/settings/api](https://www.strava.com/settings/api) en maak een app aan: naam `BenneKOM`, categorie *Training*, website = je app-adres, **Authorization Callback Domain** = je app-adres zonder `https://` (bijv. `benne-kom-hardloopclub.vercel.app`).
2. Zet bij Vercel `STRAVA_CLIENT_ID` en `STRAVA_CLIENT_SECRET` (en eventueel `STRAVA_SEGMENT_ID`, standaard 23298531) en deploy opnieuw.
3. Een nieuwe Strava-app werkt voor maximaal 10 leden. Vraag via Strava om meer capaciteit zodra het werkt.

---

## Aanpassen
- **Dinsdagtraining** (dag, tijd, plek): `lib/club.js`
- **Leermodules, clubshirts, meldingtypes**: `lib/content.js`
- **Vaste clubfoto's**: bestanden in `public/club/`, lijst in `lib/club.js` (`CLUB_PHOTOS`)
- **Kleuren en stijl**: `app/globals.css`
- **Events en nieuws**: gewoon via `/beheer` in de app

Zonder Supabase draait de app met tijdelijke voorbeelddata; handig om lokaal te testen met `npm install` en `npm run dev`.
