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

- `app/` — routes: `/` (browse, mock data), `/dashboard` (create-listing form, auth-guarded, still mock submit), `/listing/[id]` (detail, mock data), `/sign-in`, `/register`.
- `components/` — custom components + `components/ui/` (shadcn primitives, CLI-managed, eslint-ignored — add new ones with `pnpm dlx shadcn@latest add <name>`).
- `lib/api/` — typed backend client (`client.ts`, `token.ts`).
- `lib/auth/` — session provider (`auth-context.tsx`).
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
- `lib/api/client.ts` exports `authClient`/`propertyClient` (connect-es v2 `createClient(Service, transport)`, generated field names are camelCase). An interceptor attaches `Authorization: Bearer <token>` from `lib/api/token.ts`'s in-memory holder.
- Session state lives in `lib/auth/auth-context.tsx` (`AuthProvider`/`useAuth`, wraps `{children}` in `app/layout.tsx`). The access token is **memory-only**; the refresh token is an HttpOnly cookie the frontend can't read. On mount, `AuthProvider` calls `RefreshToken` to silently restore a session. `status` is tri-state (`loading | authenticated | unauthenticated`) — branch UI on `status`, not `user == null`, or you'll flash signed-out UI during the mount check.
- Sign-out calls the `Logout` RPC (clears the cookie server-side) before resetting local state.
- Page/route guarding is client-side via `useAuth()` (see `app/dashboard/page.tsx`) — there is no `middleware.ts` yet.

## Env

`.env.local` (gitignored) / `.env.example`:
- `BACKEND_ORIGIN` — read server-side at dev-server start (restart after changing it).
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — must equal `GOOGLE_CLIENT_ID` in the `torogan-be` `.env`. The Google Cloud Console OAuth client needs `http://localhost:3000` listed as an authorized JavaScript origin for Google Sign-In to work locally.

## Backend model mapping (in progress)

The mock data in `lib/properties.ts` (still used by `/`, `/dashboard`, `/listing/[id]`) doesn't line up 1:1 with the backend `Property` model yet — notably `area` is sq ft vs. backend `size_sq_m`, and `location` is a free string vs. the backend's structured `addresses` table. Wiring those pages to real data (and to `bedrooms`/`bathrooms`/`images`/`main_image_url`, all present on the backend `Property` message) is expected in a follow-up pass.
