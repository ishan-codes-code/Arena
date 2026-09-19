# Arena — Design Tokens

## Style direction
Editorial, backed by Swiss-design discipline: strong grid, oversized bold display type as the visual anchor, hairline rule dividers, data-table style listings. Explicitly not cyberpunk, not glassmorphism, not the generic neon-on-black esports look.

## Color — constants (same across every theme, never change)
- Arena Coral CTA: #D94A3D
- Arena Ink: #111514

## Color — light theme
- Paper (background): #F4F1EA
- Surface (cards): #F8F6F0
- Supporting tint: #EEE8E3
- Structural grey (secondary text): #656D69
- Hairline (dividers/borders): #D5D1C7

## Color — dark theme
- Carbon background: #040607
- Raised surface (cards): #0A0F10
- Night text: #F4F1E8
- Night hairline: #202A29
- Strong divider: #34403D

## Color — functional only (status, never brand identity)
- Live / open: #3DB7A3
- Pending review: #8978D9

## Typography
- Display / headings: Archivo, weights 700 and 900
- Body / UI text: IBM Plex Sans, weights 400 and 500
- Numeric / data (prices, timestamps, slot counts, step indices): IBM Plex Mono, tabular figures

## Rules
- Never hardcode hex values in components — reference these as Tailwind theme tokens in tailwind.config.ts
- Never use Orbitron/Rajdhani/Exo/Audiowide or similar "gaming HUD" fonts
- Coral red is the single CTA color in both light and dark themes; do not swap the action hue per theme
- Dark mode uses near-black carbon surfaces; hierarchy comes from subtle raised surfaces and dividers, not lighter grey backgrounds
