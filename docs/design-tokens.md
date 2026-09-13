# Arena — Design Tokens

## Style direction
Editorial, backed by Swiss-design discipline: strong grid, oversized bold display type as the visual anchor, hairline rule dividers, data-table style listings. Explicitly not cyberpunk, not glassmorphism, not the generic neon-on-black esports look.

## Color — constants (same across every theme, never change)
- Arena Red: #D7263D
- Arena Ink: #121212

## Color — light theme
- Paper (background): #F7F7F4
- Structural grey (secondary text): #6B6B68
- Hairline (dividers/borders): #D3D2CC

## Color — dark theme
- Night surface (background): #181818
- Night text: #F1F0EC
- Night hairline: #2A2A2A

## Color — functional only (status, never brand identity)
- Live / open: #1E9E8A
- Pending review: #B8860B

## Typography
- Display / headings: Archivo, weights 700 and 900
- Body / UI text: IBM Plex Sans, weights 400 and 500
- Numeric / data (prices, timestamps, slot counts, step indices): IBM Plex Mono, tabular figures

## Rules
- Never hardcode hex values in components — reference these as Tailwind theme tokens in tailwind.config.ts
- Never use Orbitron/Rajdhani/Exo/Audiowide or similar "gaming HUD" fonts
- Red is an accent, used sparingly — not a dominant background color
