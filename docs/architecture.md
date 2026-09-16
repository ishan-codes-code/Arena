# Arena Architecture

This project uses a feature-sliced module structure within the Next.js App Router.

## Current Structure

```text
src/
  app/
    globals.css
    layout.tsx                    # Root layout and global providers
    page.tsx                      # Thin route: renders HomeView
    modules/
      arena/
        ui/
          components/
            arena-sidebar.tsx     # Feature-owned navigation composition
          views/
            home-view.tsx         # Arena landing-page view
      theme/
        ui/
          components/
            theme-provider.tsx    # next-themes provider wrapper
            skiper-ui/
              skiper26.tsx        # Theme toggle and animation controls
              theme-icon.tsx      # Animated theme icon
  components/
    ui/                           # Shared shadcn/base UI primitives only
      button.tsx
      card.tsx
      form.tsx
      input.tsx
      label.tsx
      separator.tsx
      sheet.tsx
      sidebar.tsx
      skeleton.tsx
      tooltip.tsx
  hooks/
    use-mobile.ts                 # Shared responsive viewport hook used by Sidebar
  lib/
    utils.ts                      # Shared utilities such as cn
```

## Module Rules

- `src/app/` contains route files, layouts, global styles, and route-level wiring only.
- Route files stay thin. A page imports and renders a top-level view from `modules/<feature>/ui/views/`.
- Each feature domain gets its own `src/app/modules/<feature>/` folder.
- Feature-specific components belong in `modules/<feature>/ui/components/`.
- `src/components/ui/` is reserved for shared shadcn/base UI primitives. Do not place feature-specific UI there.
- `ArenaSidebar` is composed in `modules/arena/ui/components/`; `components/ui/sidebar.tsx` remains the shared shadcn primitive.
- Add `schemas.ts` only when the feature has Zod validation.
- Add `types.ts` only when the feature has shared or inferred types that need a module-level home.
- Add `server/` only when the feature has server-side data-layer functions.
- Add feature-scoped hooks under the feature module only when the feature needs them.
- Add shared hooks under `src/hooks/` only when they are genuinely cross-feature.
- Do not create `db/`, `trpc/`, `inngest/`, or similar technology folders until the corresponding library and functionality are adopted.

## Current Feature Ownership

### `arena`

Owns the landing-page experience and its top-level `HomeView`.

### `theme`

Owns the theme provider and Skiper UI theme-toggle implementation. This is a cross-cutting UI concern, but it remains a module so the route and shared UI directories stay focused.

## Shared Boundaries

- Tailwind remains the styling system.
- The existing shadcn/base UI primitives remain in `src/components/ui/`.
- `next-themes` remains the theme implementation.
- `src/lib/` contains shared utilities and service wrappers, not feature views.
- No database, API, validation, or background-job layer is currently adopted.
