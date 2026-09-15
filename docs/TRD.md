# Technical Requirements Document — Arena MVP

## 1. Authentication
Email + password for MVP via Supabase Auth (built-in). Phone/OTP deferred — no free-tier SMS OTP provider exists in India. Schema includes unused `phone_number` and `phone_verified` (bool, default false) columns on `profiles` for forward compatibility. Email verification required before tournament registration.

## 2. Data Freshness
Refresh-based, not real-time. No Supabase Realtime subscriptions in MVP. Optimistic local UI update allowed after a player's own registration action.

## 3. Bot / Spam Protection
Cloudflare Turnstile on signup and tournament registration. Rate limiting at the API layer (Vercel Edge Middleware or Supabase Edge Function) on registration attempts per IP/account. Unique DB constraint on (game_title, in_game_uid) in game_identities blocks duplicate-ID registration across accounts.

## 4. Session & Access Control
Supabase JWT sessions, auto-refresh via client SDK. Row-Level Security on every table:
- profiles: user reads/updates only their own row
- game_identities: user reads/writes only rows where user_id = auth.uid()
- tournament_participants: user reads only their own rows; role='admin' reads all
- rooms: readable only by confirmed participants, only after published_at has passed
Admin role is a flag on profiles (role='admin'), checked server-side on every admin route.

## 5. File Uploads
Supabase Storage, private bucket only. Client-side compression before upload (target under ~500KB). Accept JPEG/PNG only, max 5MB pre-compression. Signed URLs with short expiry for admin viewing — never permanently public links.

## 6. Environments & Deployment
Two environments: staging (Vercel preview + separate Supabase project) and production. Env vars via Vercel's environment variable manager, never committed. Main branch auto-deploys to production; other branches get preview URLs.

## 7. Data Model (full schema)

profiles: user_id (uuid, pk), phone_number, username, date_of_birth, role (player/admin), created_at

game_identities: id (pk), user_id (fk), game_title, in_game_name, in_game_uid, account_level, profile_screenshot_url — unique constraint on (game_title, in_game_uid)

tournaments: id (pk), game_title, title, map, format (solo), start_time, max_slots, status (open/full/live/completed), eligibility_min_level, prize_1st, prize_2nd, prize_3rd (text description)

tournament_participants: id (pk), tournament_id (fk), user_id (fk), game_identity_id (fk), slot_number, status (registered/checked_in/disqualified), result_rank, result_screenshot_url, reward_status (pending/verified/issued)

rooms (admin-only table): tournament_id (fk), room_id, room_password, published_at

## 8. Browser / Device Support
Mobile-first, tested primarily on Chrome/Android. Desktop support required for admin panel. Responsive web only, no native app in MVP.
