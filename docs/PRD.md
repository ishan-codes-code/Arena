# Product Requirements Document — Arena (MVP v1)

## 1. Vision
A free-entry gaming tournament platform for everyday Indian mobile gamers — not pro esports teams. A player should be able to think "whenever I want to compete, I go to Arena." Long-term ambition is a recognizable competition + content + community brand; this PRD scopes only the first buildable version.

## 2. Problem & Audience
Casual/semi-serious mobile gamers in India have no accessible, structured place to compete regularly without entry fees or needing to belong to a professional org. Target: solo players, pan-India, starting with Free Fire MAX. Not competing with pro-tier organizers (NODWIN, Skyesports) — closer to BattleX/Playnex/Game.tv/Repeat.gg in positioning, differentiated by design quality, trust, and eventual content flywheel.

## 3. MVP Scope

**In scope**
- One game: Free Fire MAX
- Solo tournaments only
- Free entry, always — no paid tiers, no entry fee, anywhere
- Manual room-code distribution, manual result verification (no OCR/automation yet)
- Direct voucher prizes for top 3 (Amazon/Flipkart/Google Play etc.) — no coin/wallet/loyalty currency
- Persistent player profile (not per-tournament identity)
- Email + password auth (phone/OTP deferred — no viable free-tier SMS provider found)
- Admin panel for tournament creation, registration review, result entry, reward marking

**Out of scope for v1**
- Multi-game support, team tournaments
- Automated anti-cheat / OCR result verification
- Coin/loyalty currency or any stored-value wallet (RBI PPI licensing risk)
- Live/real-time slot updates (refresh-based is sufficient)
- Streaming integration, sponsorships, brand deals
- Public leaderboard/social features
- NSGA/OGAI esports registration workflow (separate legal workstream, not a product feature)

## 4. Core User Flows

**Player**
1. Sign up (email + password, email verification required)
2. Add game identity: in-game name, UID, account level, profile screenshot
3. Browse open tournaments, open one, register (blocked if below eligibility level)
4. Complete Turnstile captcha at registration
5. 15 minutes pre-start: room ID/password appear on dashboard (confirmed registrants only)
6. Play match in-game
7. Submit end-of-match screenshot as result proof
8. See finalized result and reward status on dashboard once admin verifies

**Admin**
1. Create tournament (game, map, format, time, slots, eligibility level, prize descriptions)
2. Review registrations, view screenshots, disqualify/kick if needed
3. Publish room ID/password 15 minutes pre-start
4. Review submitted result screenshots, enter final ranks, finalize tournament
5. Mark top-3 reward status (pending → verified → issued), fulfill vouchers manually

## 5. Feature Requirements by Page

| Page | Must include |
|---|---|
| Home | Hero, featured tournament highlight, how-it-works (4-step), CTA to browse |
| Tournaments list | Filterable list (game/status), card shows game, map, time, slots, prize |
| Tournament detail | Rules, eligibility, prize breakdown, registration form |
| Player dashboard | Registered/past tournaments, result status, reward status, profile edit |
| Login/Signup | Email + password, captcha, email verification gate |
| Admin — tournament list | Create/edit tournaments |
| Admin — tournament detail | Participants + screenshots, room publishing, result entry, reward marking |

## 6. Data Model
Core entities: profiles, game_identities (unique per game_title + UID), tournaments, tournament_participants, rooms. Full schema in TRD.md.

## 7. Compliance Guardrails
- No cash prizes — vouchers only, winner chooses from a list
- No entry fee, no deposit, no stake, anywhere
- No stored-value coin/wallet system — direct voucher issuance only
- PAN collection field built into reward-claim flow, pending TDS legal confirmation
- Publisher non-endorsement disclaimer sitewide ("Not affiliated with or endorsed by Garena")
- Age capture at signup
- Screenshots stored privately (private Storage bucket, signed URLs only)

## 8. Design System
See design-tokens.md for exact values.

## 9. Tech Stack
Next.js + Tailwind (frontend) · Supabase — Postgres/Auth/Storage/RLS (backend) · Vercel (hosting) · Cloudflare Turnstile (bot protection).

## 10. Non-Functional Requirements
- Mobile-first responsive; admin panel also works at desktop widths
- Forms usable one-handed on small screens
- Screenshot uploads handle poor mobile connections gracefully
- Row-Level Security on every table

## 11. Success Criteria for MVP
Not revenue. Validate: (a) real players acquired/retained on a free tournament loop, (b) manual admin workflow holds up at small scale, (c) duplicate-ID check reduces smurfing.

## 12. Known Open Items
- NSGA/OGAI esports registration requirement, still unresolved
- Whether Section 194BA or 393(3) governs TDS on voucher prizes
- Voucher fulfillment: fully manual vs. in-app claim step
- Admin notifications: manual checks vs. email alerts
