-- 021: betalen via de app (bunq.me-link). Leden kunnen aangeven dat ze betaald hebben; Aart bevestigt in Beheer.
-- Plak dit in Supabase → SQL Editor → New query → Run. Veilig om vaker te draaien.
alter table singlet_claims add column if not exists paid_reported_at timestamptz;
alter table shirt_interest add column if not exists paid_reported_at timestamptz;
alter table shirt_interest add column if not exists paid boolean not null default false;
