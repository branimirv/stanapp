# Plan 09 — Backend modularization

**Goal:** Hygiene and reusable patterns across Postgres, edge functions, and the client data layer — not a rewrite.

**Status:** Done

## Rules

- Edge functions only when **service role** is required (Auth admin). CRUD stays table + RLS + RPCs.
- Aggregates stay in `utils/` — no dashboard SQL RPC unless measured.
- Migrations are the only apply path; never re-apply `schema.sql` on top of migrations.
- Keep flat Expo layout (`services/`, `lib/`, `supabase/`).

## Tracks

### 1 — Schema source of truth and local DX

- [x] Migrations-only apply path (`db push` / `db reset`)
- [x] `schema.sql` marked as reference dump only
- [x] Seed disabled until a real `seed.sql` exists
- [x] Getting started + `pnpm gen:types`
- [x] Local vs production Auth documented

### 2 — Edge functions

- [x] Delete unused `accept-invites` (RPC remains the accept path)
- [x] Shared helpers: `_shared/{cors,http,auth,admin}.ts` + `deno.json`
- [x] Harden `invite-to-properties`: POST, email regex, stable errors, email lookup via RPC

### 3 — SQL / RLS hygiene

- [x] `search_path` on `handle_updated_at`
- [x] `auth_user_id_by_email` (service_role only)
- [x] `property_members` → `profiles` FK for PostgREST embeds
- [x] Document public `property-photos` reads

### 4 — Client data layer

- [x] Shared invalidation: members / invites / categories / accept-invites
- [x] Members: single embed query
- [x] Dashboard: `utils/dashboardPeriod` + one properties query
- [x] Unit tests for dashboard period helpers

## Done when

- [x] Fresh `supabase db reset` does not require a missing seed file
- [x] One live edge function with shared modules
- [x] Invite response contract unchanged (`batchId`, `invitedCount`, `authInviteSent`)
- [x] `pnpm test` covers new dashboard helpers

## Non-goals

- Moving reports/dashboard math into Postgres
- CRUD edge functions
- Email notify for existing invitees
- Squashing migrations / pgTAP

← [Plans index](./README.md)
