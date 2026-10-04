# Arena Architecture

## 1. Purpose

This document describes Arena's approved target architecture and the
responsibility boundaries that guide its development. The repository is
currently being migrated toward this structure; the target layout below does
not imply that the migration has already happened.

## 2. Core Principles

- Keep one canonical product-module root: `src/modules/`.
- Put product behavior with the domain that owns it.
- Keep `src/app` focused on Next.js application composition.
- Keep `src/lib` focused on technical infrastructure.
- Treat tRPC as transport, not as the primary home for business logic.
- Prefer clear ownership and cohesive responsibilities over identical folder
  structures or speculative abstractions.
- Preserve existing boundaries unless there is a real ownership, dependency,
  cohesion, or maintainability problem.

## 3. High-Level Structure

The approved conceptual structure is:

```text
src/
├── app/          # Next.js routing and application composition
├── modules/      # Product and domain ownership
├── components/   # Shared UI and UI-library components
├── hooks/        # Genuinely cross-domain hooks
├── lib/          # Technical infrastructure
├── trpc/         # tRPC transport and infrastructure
└── proxy.ts
```

The primary dependency direction is:

```text
src/app
    ↓
src/modules
    ↓
src/lib
```

For tRPC-backed operations, the preferred direction is:

```text
UI or Server Component
    ↓
src/trpc
    ↓
module server operation
    ↓
src/lib
```

These diagrams describe responsibility boundaries, not a requirement that
every request follow exactly the same path.

## 4. `src/app` — Next.js Application Layer

`src/app` owns Next.js routes and application composition, including:

- Routes, layouts, loading states, and error boundaries
- Route-level composition and redirects
- Route-level authentication checks
- Next.js providers
- Genuine HTTP route handlers

Small route-specific logic is appropriate here. For example, a route-level
authentication check followed by a redirect does not need to be moved simply
to make the route file empty.

## 5. `src/modules` — Product Domains

`src/modules` is the single canonical directory for genuine product/domain
ownership. The current Arena implementation establishes these domains:

- `auth`
- `games`

Domain-specific behavior and UI belong with their owning module. Modules may
have different internal structures: add folders and files when the actual
domain needs them, not to make every module look alike.

## 6. Routes Are Not Domains

A URL does not, by itself, establish a product domain. Routes such as
`/tournaments`, `/rankings`, or `/profile` do not automatically justify
creating `src/modules/tournaments/`, `src/modules/rankings/`, or
`src/modules/profile/`.

Create a module when the implementation establishes a meaningful, independent
product/domain responsibility—not merely because a route exists.

## 7. The Legacy `src/app/modules` Structure

The old `src/app/modules` structure is not the canonical module location and
must eventually disappear. The repository is being migrated toward
`src/modules`, but this document does not claim that the migration is already
complete.

Migration is based on responsibility, not a blind directory rename. In
particular, the old `competition` grouping is not automatically a
`competition` domain: its code includes responsibilities such as the landing
experience and application-wide navigation/sidebar behavior. Place those
responsibilities according to what they actually own.

## 8. `src/components` — Shared UI

Preserve the existing shared component namespaces:

```text
src/components/
├── ui/                 # shadcn/ui components
├── animate-ui/         # Animate UI components
├── kokonotui/          # KokonutUI components
├── navbar.tsx          # Arena-owned application-wide shared component
└── route-transition.tsx # Arena-owned application-wide shared component
```

Do not merge these folders merely for structural consistency. Domain-specific
UI belongs in its domain—for example,
`src/modules/games/ui/components/game-card.tsx`. Put UI in `src/components`
when it is genuinely shared across domains.

`theme` is a cross-cutting UI/infrastructure concern, not a product domain.
Do not make it an independent product module just to make the module structure
symmetrical.

## 9. `src/hooks`

Use `src/hooks` for hooks that are genuinely shared across domains. A
domain-specific hook belongs with its owning module.

## 10. `src/lib` — Infrastructure

`src/lib` contains technical infrastructure; it must not become a dumping
ground for product/domain behavior. Database infrastructure belongs under
`src/lib/db/`, and low-level Supabase infrastructure belongs under
`src/lib/supabase/`.

Behavior specific to a product domain, even when it uses infrastructure,
belongs in the owning module.

## 11. `src/trpc` — Application Transport

tRPC is a transport layer. Keep routers focused on exposing operations and
delegating work to module-owned operations:

```text
tRPC router → module operation → infrastructure
```

Routers should not progressively become the primary location for business
logic.

## 12. `src/app/api` — HTTP Boundaries

`src/app/api` is the Next.js HTTP boundary. Use it for genuine HTTP use cases
such as webhooks, external callbacks, third-party integrations, and public
HTTP endpoints.

Do not create duplicate REST/API and tRPC implementations for the same
internal operation without a concrete reason.

## 13. Responsibility / Dependency Boundaries

Keep transport, domain behavior, and infrastructure responsibilities distinct:

- `src/app` owns Next.js application composition and HTTP boundaries.
- `src/modules` owns product/domain behavior.
- `src/trpc` owns tRPC transport.
- `src/lib` owns technical infrastructure.
- `src/components` and `src/hooks` hold shared UI and genuinely cross-domain
  hooks, respectively.

These are ownership guidelines. Follow the responsibility of the code rather
than forcing every feature through identical layers.

## 14. File Size and Refactoring

File size is not an architectural rule. A large file is a signal to examine,
not an automatic reason to split it. Refactor when responsibilities are
unrelated, cohesion is poor, or the code is difficult to reason about. Do not
impose arbitrary line-count limits.

## 15. Adding a New Domain

Add a module only when real implementation establishes a meaningful
independent product/domain responsibility. First identify what the code owns
and how it relates to existing domains. Do not infer a domain from a URL,
create placeholder modules for hypothetical features, or add a standard set of
folders merely because another module has them.

When ownership is genuinely unclear, clarify it before introducing a new
domain boundary.

## 16. Architecture Evolution

Arena is early-stage. Let architecture evolve from real requirements and
preserve clear existing boundaries. Refactor when there is a genuine ownership,
dependency, cohesion, or maintainability problem—not simply because another
subsystem has a different folder structure.

## 17. Architectural Goal

Prefer:

```text
clear ownership + cohesive responsibilities + a simple growth path
```

over:

```text
identical folders + maximum abstraction + hypothetical future architecture
```
