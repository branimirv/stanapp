# StanApp

A mobile-first personal property management app for owners who manage multiple properties — apartments, houses, and garages. Track usage, tenants, expenses, rent payments, and financial reports in one place.

**Platforms:** iOS and Android (React Native + Expo)  
**Languages:** English and Croatian (Hrvatski)

---

## Features

- **Properties** — Manage apartments, houses, garages, and other types with address, area, usage status, rent amount, notes, and photos
- **Usage statuses** — `rented`, `personal use`, or `vacant`; tenant and rent features appear only for rented properties
- **Sub-properties** — Attach garages to a parent apartment/house or keep them standalone
- **Tenants** — Contracts, contact info, and deposit tracking (rented properties only)
- **Expenses** — Recurring utilities and one-time costs (repairs, insurance, property tax, etc.) with categories and receipt photos
- **Rent payments** — Per-tenant, per-period tracking with pending/paid/late/partial status and a 12-month grid view
- **Dashboard** — Monthly income, expenses, net income, overdue alerts, and recent activity
- **Reports** — Income vs. expenses charts, category breakdown, per-property summary, PDF/CSV export
- **Notifications** — Local reminders for upcoming due dates and overdue expenses
- **Settings** — Language, currency, theme (light/dark/system), profile, and notification preferences

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 56 |
| Language | TypeScript (strict) |
| Routing | Expo Router (file-based) |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| State | Zustand |
| UI | React Native Paper (Material Design 3) |
| Forms | React Hook Form + Zod |
| Charts | react-native-gifted-charts |
| i18n | i18next + react-i18next + expo-localization |
| Icons | Lucide React Native |

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (project uses `pnpm@10.6.5`)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (via `npx expo`)
- A [Supabase](https://supabase.com/) project
- iOS Simulator (Xcode) and/or Android Emulator, or Expo Go on a physical device

---

## Getting Started

### 1. Clone and install

```bash
git clone <repository-url>
cd stanapp
pnpm install
```

### 2. Configure environment

Copy the example env file and add your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Find these values in the [Supabase dashboard](https://supabase.com/dashboard/project/_/settings/api) under **Project Settings → API**.

### 3. Set up the database

Run the SQL schema in your Supabase project's SQL Editor:

```bash
# Schema file in the repo:
supabase/schema.sql
```

This creates tables (`profiles`, `properties`, `tenants`, `expense_categories`, `expenses`, `rent_payments`), triggers, Row Level Security policies, and storage buckets for receipts and property photos.

Optionally regenerate TypeScript types after schema changes:

```bash
npx supabase gen types typescript \
  --project-id YOUR_PROJECT_ID \
  --schema public > types/database.types.ts
```

### 4. Run the app

```bash
pnpm start
```

Then press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

Other scripts:

```bash
pnpm ios       # Start with iOS
pnpm android   # Start with Android
pnpm web       # Start web build
```

---

## Project Structure

```
stanapp/
├── app/                    # Expo Router screens
│   ├── (auth)/             # Login, register, forgot password
│   ├── (tabs)/             # Dashboard, properties, expenses, reports
│   ├── property/           # Property detail, add, edit
│   ├── tenant/             # Tenant management
│   ├── expense/            # Expense management
│   ├── rent/               # Rent payments
│   └── settings/           # Profile, notifications, preferences
├── components/             # UI and feature components
├── hooks/                  # Data hooks (Supabase CRUD)
├── stores/                 # Zustand stores (auth, UI, theme)
├── lib/                    # Supabase client, auth, notifications
├── i18n/                   # English + Croatian translations
├── types/                  # Database and app types
├── utils/                  # Formatters, validators, export
├── constants/              # Theme, config
├── supabase/               # Database schema
└── prompts/                # Full project specification
```

---

## Property Model

| Concept | Values / behavior |
|---|---|
| Property type | `apartment`, `house`, `garage`, `other` |
| Usage status | `rented` (tenants + rent enabled), `personal_use`, `vacant` |
| Sub-property | Garage with `parent_property_id` → linked to parent; `NULL` → standalone |
| Expenses | Recurring (utilities) or one-time (repairs, tax, insurance) |

---

## Internationalization

The app supports **English** (`en`) and **Croatian** (`hr`). All user-facing strings use `useTranslation()` — no hard-coded labels in components.

- Device locale is detected on first launch (fallback: Croatian)
- Language preference is stored in `profiles.language` and synced on login
- Expense categories use stable DB keys (`electricity`, `water`, …) translated at render time

Translation files: `i18n/locales/en.json`, `i18n/locales/hr.json`

---

## Authentication

Supabase Auth with email/password. A profile row is auto-created on signup via a database trigger. Row Level Security ensures users only access their own data.

---

## Development Notes

- **Package manager:** pnpm (`packageManager` field in `package.json`)
- **Path aliases:** `@/*` maps to project root (see `tsconfig.json`)
- **Reanimated:** `babel.config.js` must keep `react-native-reanimated/plugin` as the last Babel plugin
- **Full spec:** See [`prompts/stanapp-firstprompt.md`](prompts/stanapp-firstprompt.md) for detailed screen specs, UX patterns, and build order

---

## License

Private project.
