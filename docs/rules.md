# Arena Development Rules

These rules apply to developers and AI coding agents working in Arena. Use
them alongside [the architecture guide](./architecture.md).

## 1. Inspect Before Changing

Read the relevant documentation and inspect the existing implementation before
changing code or structure. Understand current ownership, dependencies, and
behavior first.

## 2. One Canonical Module Root

`src/modules/` is the one canonical product-module directory. The legacy
`src/app/modules/` path has been removed; do not create or reintroduce it.

## 3. Routes Are Not Domains

A route or URL does not automatically justify a module. Establish meaningful
product/domain ownership before adding a module.

## 4. No Speculative Modules

Do not create placeholder modules or architecture for hypothetical features.
Add a domain when real implementation establishes the need.

## 5. Keep `src/app` Focused on Next.js

Use `src/app` for routes, layouts, loading and error states, route-level
composition, redirects, route-level authentication checks, Next.js providers,
and genuine HTTP route handlers. Small route-specific logic is allowed; do not
move it solely to make a route file empty.

## 6. Product Behavior Belongs in Modules

Keep domain-specific product behavior with its owning module. Domain-specific
UI and hooks belong there too, rather than in shared directories.

## 7. Infrastructure Belongs in `src/lib`

Keep technical infrastructure in `src/lib`, including database infrastructure
under `src/lib/db/` and low-level Supabase infrastructure under
`src/lib/supabase/`. Do not use `src/lib` as a home for product/domain
behavior; domain-specific behavior built on infrastructure belongs in its
module.

## 8. Keep tRPC Thin

tRPC is transport. Prefer routers that delegate to module operations, which
use infrastructure as needed. Do not make routers the primary home for
business logic.

## 9. Avoid Duplicate Internal APIs

Use `src/app/api` for real HTTP use cases such as webhooks, external callbacks,
third-party integrations, and public endpoints. Do not duplicate an internal
operation in REST/API and tRPC without a concrete reason.

## 10. Preserve Shared Component-Library Namespaces

Keep the existing `src/components` namespaces distinct:

- `ui/` for shadcn/ui
- `animate-ui/` for Animate UI
- `kokonotui/` for KokonutUI
- `navbar.tsx` and `route-transition.tsx` for Arena-owned
  application-wide shared components

Do not merge these folders just for consistency. `theme` is cross-cutting UI
or infrastructure, not a product domain.

## 11. Shared UI vs Domain UI

Put UI in `src/components/` only when it is genuinely shared across domains.
Keep domain-specific UI with its owner—for example,
`src/modules/games/ui/components/game-card.tsx`.

## 12. Modules Do Not Need Identical Structures

Create module folders and files when the domain needs them. Do not add
`server/`, `queries/`, `hooks/`, `lib/`, `schemas.ts`, or `types.ts` merely
because another module has those structures.

## 13. Cohesion Over Line Count

A large file is a signal to inspect responsibilities, not a violation by
itself. Refactor when cohesion is poor, responsibilities are unrelated, or
the code is difficult to reason about. Do not impose arbitrary line-count
limits.

## 14. Preserve Clear Existing Boundaries

Do not reorganize a subsystem just because it differs from another
subsystem's folder structure. Change boundaries to address a real ownership,
dependency, cohesion, or maintainability problem.

## 15. Separate Transport, Behavior, and Infrastructure

Keep responsibilities clear: `src/trpc` handles transport, `src/modules`
handles product/domain behavior, and `src/lib` handles technical
infrastructure. `src/app` composes the Next.js application and owns HTTP
boundaries. Follow responsibility rather than forcing every request through
an identical sequence of layers.

## 16. Respect Server/Client Boundaries

Preserve the framework's server/client boundaries when moving or adding code.
Keep server-only operations on the server and do not make server
infrastructure or secrets available to client code. Preserve the existing
rendering and interaction behavior when changing component boundaries.

## 17. Preserve Product Behavior During Migrations

Migrate according to responsibility, not by blindly renaming or moving
directories. Preserve existing product behavior, routes, and user-facing
interactions unless a behavior change is explicitly intended.

## 18. Refactor Incrementally and Verify Changes

Make focused changes that follow existing patterns. After migrations or
structural changes, verify relevant imports, types, tests, and application
behavior with the repository's available checks. Do not treat a successful
file move as proof that the migration works.

## 19. Keep Documentation Accurate

Update relevant documentation when architecture or behavior changes. Clearly
distinguish the approved target structure from the structure already present
in the repository; never document a migration as complete before it is.

## 20. AI-Agent Development Rules

Before changing Arena's architecture or code structure, future agents must:

- Read `docs/architecture.md` and `docs/rules.md`.
- Inspect the existing implementation before changing structure.
- Respect ownership boundaries.
- Avoid speculative abstractions.
- Avoid duplicate infrastructure.
- Preserve shared UI-library boundaries.
- Preserve product behavior.
- Verify changes after migrations.
- Ask for clarification instead of inventing a domain when ownership is
  genuinely ambiguous.

## 21. Final Architectural Principle

Prefer clear ownership, cohesive responsibilities, and a simple growth path
over identical folders, maximum abstraction, or hypothetical future
architecture.
