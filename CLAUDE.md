# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```
pnpm dev            # dev server on :3000
pnpm build           # production build
pnpm lint            # eslint
pnpm tsc --noEmit    # type-check — do this explicitly; next.config.mjs sets
                      # typescript.ignoreBuildErrors: true, so `pnpm build`
                      # will NOT catch type errors on its own
```

Package manager is **pnpm** (only `pnpm-lock.yaml` is present — don't use npm/yarn).

## Architecture

Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4 (CSS-based config in `app/globals.css`, no `tailwind.config.*` file). Path alias `@/*` → repo root (no `src/` dir).

- `app/` — routes: `/` (browse), `/dashboard` (create-listing form, auth-guarded), `/listing/[id]` (detail), `/profile`, `/sign-in`, `/register`. All wired to real backend data.
- `components/` — custom components + `components/ui/` (shadcn primitives, CLI-managed, eslint-ignored — add new ones with `pnpm dlx shadcn@latest add <name>`).
- `hooks/` — connect-query hooks, one file per RPC, grouped by backend service domain (see "Data fetching" below).
- `lib/api/` — typed backend client (`client.ts`, `token.ts`).
- `lib/auth/` — session provider (`auth-context.tsx`).
- `lib/providers/` — `app-providers.tsx`, the client-side provider tree (`TransportProvider` → `QueryClientProvider` → `AuthProvider`) mounted in `app/layout.tsx`.
- `lib/gen/` — **generated, never edit.**

## shadcn is on Base UI, not Radix

`components.json` style is `base-nova`, built on `@base-ui/react`. Polymorphism uses `nativeButton={false} render={<Link href="..." />}`, **not** Radix's `asChild`. This applies to every new link-styled button.

## Generated API types — `lib/gen/`

TypeScript types and Connect clients are generated from the **same protos as the backend**, via buf in the `torogan-be` repo (not here). To regenerate after a backend proto change:

```
cd ../torogan-be && make proto-gen
```

This runs `buf generate --template buf.gen.ts.yaml --include-imports`, emitting `lib/gen/{auth,property,feature,address}_pb.ts` (protoc-gen-es v2 — schema-based, no `*_connect.ts` files). Never hand-edit anything under `lib/gen/`.

## API layer and auth pattern

- All backend calls go through the `/rpc/:path*` rewrite proxy in `next.config.mjs` (→ `BACKEND_ORIGIN`, default `http://localhost:8080`), so browser requests are same-origin — no CORS needed, and the backend's `SameSite=Strict` refresh cookie just works. **Never point the transport directly at the backend origin from the browser.**
- `lib/api/client.ts` exports the shared `transport` plus one plain `createClient(Service, transport)` per service (`authClient`, `propertyClient`, `addressClient`, `userClient`, `uploadClient`, `featureClient` — generated field names are camelCase). An interceptor attaches `Authorization: Bearer <token>` from `lib/api/token.ts`'s in-memory holder. `authClient` is the one plain client still called directly (from `auth-context.tsx`) — everything else should go through a `hooks/` hook instead (see "Data fetching" below).
- Session state lives in `lib/auth/auth-context.tsx` (`AuthProvider`/`useAuth`, mounted inside `lib/providers/app-providers.tsx` in `app/layout.tsx`). The access token is **memory-only**; the refresh token is an HttpOnly cookie the frontend can't read. On mount, `AuthProvider` calls `RefreshToken` to silently restore a session. `status` is tri-state (`loading | authenticated | unauthenticated`) — branch UI on `status`, not `user == null`, or you'll flash signed-out UI during the mount check. This flow intentionally stays on the plain `authClient`, not connect-query (see below).
- Sign-out calls the `Logout` RPC (clears the cookie server-side) before resetting local state.
- Page/route guarding is client-side via `useAuth()` (see `app/dashboard/page.tsx`) — there is no `middleware.ts` yet.

## Data fetching — connect-query + `hooks/`

Everything except the auth flow goes through `@connectrpc/connect-query` (`useQuery`/`useMutation`) instead of calling a `lib/api/client.ts` client directly from a component.

- **One hook file per RPC**, under `hooks/<domain>/`, where `<domain>` mirrors the backend service (`properties/`, `addresses/`, `features/`, `users/`, `uploads/`). Naming: queries are `useGet<Noun>` (even when the RPC verb is `List` — e.g. `ListFeatures` → `useGetFeatures`), mutations are `use<Verb><Noun>` matching the RPC name (`useCreateProperty`, `useAddPropertyFeature`). Each hook is a thin wrapper, e.g.:

  ```ts
  // hooks/properties/useCreateProperty.ts
  import { useMutation } from '@connectrpc/connect-query'
  import { PropertyService } from '@/lib/gen/property_pb'

  export function useCreateProperty() {
    return useMutation(PropertyService.method.createProperty)
  }
  ```

  The method reference (`PropertyService.method.<rpc>`) comes straight off the existing protoc-gen-es v2 output in `lib/gen/` — no extra codegen step, no `protoc-gen-connect-query` plugin.
- **Multi-step flows stay orchestrated in the component**, not hidden in a composed hook: e.g. `app/dashboard/page.tsx`'s submit calls `createProperty.mutateAsync(...)`, then a **sequential** `for` loop of `addPropertyImage.mutateAsync(...)` (each add is a read-count-then-insert on the backend — concurrent calls race on which image becomes "main", so don't switch this to `Promise.all`), then `addPropertyFeature.mutateAsync(...)` per selected amenity, then `createAddress.mutateAsync(...)`.
- **Independent reads should be separate `useQuery` calls, not sequential `await`s** — e.g. `app/listing/[id]/page.tsx` fires `useGetProperty`/`useGetPropertyAddress`/`useGetPropertyFeatures` in parallel (all keyed on the same `id`, gated with `enabled` on auth status), rather than chaining them.
- **Providers**: `lib/providers/app-providers.tsx` (`'use client'`) wraps `TransportProvider` (reusing `transport` from `lib/api/client.ts`) → `QueryClientProvider` → `AuthProvider`. The `QueryClient` is created with `useState(() => new QueryClient())` inside that component, not at module scope — a module-scope client would be shared across requests/users if this ever runs on the server, which is the standard TanStack Query SSR footgun.
- **Auth is the deliberate exception** — `lib/auth/auth-context.tsx` keeps calling `authClient` directly. Its `refreshToken`-on-mount bootstraps the token every other request depends on, and TanStack Query v5 dropped per-query `onSuccess`/`onError` callbacks, so folding it into connect-query isn't a mechanical swap. Don't migrate it without discussing the state-model change first.

## Env

`.env.local` (gitignored) / `.env.example`:
- `BACKEND_ORIGIN` — read server-side at dev-server start (restart after changing it).
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — must equal `GOOGLE_CLIENT_ID` in the `torogan-be` `.env`. The Google Cloud Console OAuth client needs `http://localhost:3000` listed as an authorized JavaScript origin for Google Sign-In to work locally.
