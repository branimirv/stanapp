# Plan 06 — State & data layer

**Goal:** Clear state boundaries; less invalidation copy-paste; predictable auth side effects.

**Status:** Done

## Deliverables

- [x] `lib/queryInvalidation.ts` — property/expense/tenant/rent domain helpers
- [x] Mutation hooks use shared invalidation
- [x] Invite accept moved to `lib/syncPendingInvites.ts` (bootstrap / auth gate — not store setters)
- [x] Auth store setters are pure state updates
- [x] Platform sheet padding constant where extracted
- [x] NativeTabs remain native chrome

## Done when

- [x] Mutation hooks share invalidation helpers
- [x] Auth store setters are pure state updates
