# Project structure

```
stanapp/
├── app/                      # Expo Router screens
│   ├── (auth)/               # Login, register, forgot password
│   ├── (tabs)/               # Native tabs: dashboard, properties, expenses, reports, me
│   ├── property/             # Property detail, add, edit
│   ├── tenant/               # Tenant management
│   ├── expense/              # Expense management
│   ├── rent/                 # Rent payments
│   ├── settings/             # Nested settings routes
│   ├── invite.tsx            # Accept property invite deep link
│   └── dev/                  # Dev-only screens
├── components/
│   ├── ui/                   # Shared App* primitives (buttons, sheets, headers, …)
│   ├── dashboard/            # Dashboard widgets
│   ├── property/             # Property UI
│   ├── expense/              # Expense UI
│   ├── reports/              # Analitika UI
│   ├── rent/ · tenant/ · auth/ · members/
│   └── navigation/
├── hooks/                    # React Query wrappers + screen orchestration
├── services/                 # Supabase / edge I/O only (no React)
├── stores/                   # Zustand (auth, UI, theme, tab bar)
├── lib/                      # Infrastructure: supabase, queryClient, routes, auth
├── i18n/                     # English + Croatian translations
├── types/                    # Database and app types
├── utils/                    # Pure domain helpers (formatters, validators, export)
├── constants/                # Theme tokens (JS mirror), static config
├── global.css                # Uniwind / Naslov CSS variables (source of truth for hex)
├── supabase/                 # schema.sql, migrations, Edge Functions
├── docs/                     # Product & engineering docs (often local / gitignored)
├── screenshots/              # Durable before/after captures
├── tmp/                      # Throwaway scratch (gitignored) — not app structure
└── prompts/                  # Local AI prompts (gitignored) — not app structure
```

**Folder boundaries:** `constants/` = static tokens/config · `lib/` = app infrastructure · `utils/` = pure sync helpers. Do not nest these under `src/` or `core/` — Expo Router expects `app/` at the repo root.

**Optimization plans:** [docs/plans/](./plans/README.md) (separate executable tracks)

← [README](../README.md)
