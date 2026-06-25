# StanApp — Cursor AI Project Prompt

> **Instructions for Cursor:** This document is the complete specification for the **StanApp** mobile application. Follow every section in order. Do not skip steps. Generate production-quality code with TypeScript strict mode, proper error handling, loading/empty/error states, full Supabase integration, and bilingual UI (English + Croatian) throughout. When a file is referenced, create it in full — never leave placeholder comments like `// TODO` without implementing them.

---

## 1. Project Overview

**App Name:** StanApp *(Alternative suggestions: PropTrack, StanManager, MyProperties)*

**Description:**
StanApp is a mobile-first **personal property management** app for owners who manage multiple properties — apartments, houses, and garages. Properties can be **rented out**, used **personally**, or left **vacant**. A garage can be a standalone property or attached to a parent apartment/house.

The app allows you to:

- Manage all property types in one place (address, type, area, usage status, rent amount, notes, photos)
- Attach garages to parent properties or keep them as separate entries
- Track tenants and contracts **only for rented properties** (optional per property)
- Log recurring utilities and one-time expenses (repairs, insurance, property tax, etc.)
- Track rent payments per tenant and period (when property is rented)
- View financial reports with charts (income vs. expenses, per-property breakdown)
- Receive **local** notifications for upcoming due dates and overdue expenses
- Export reports as PDF or CSV
- Switch between **English** and **Croatian** at any time

**Platform:** React Native with Expo (SDK 52+)
**Language:** TypeScript (strict mode enabled)
**UI Languages:** English (`en`) and Croatian (`hr`)
**Target platforms:** iOS and Android

### Property model at a glance

| Concept | Values / behavior |
|---|---|
| Property type | `apartment`, `house`, `garage`, `other` |
| Usage status | `rented` (tenants + rent enabled), `personal_use`, `vacant` |
| Sub-property | Garage with `parent_property_id` set → linked to parent; `NULL` → standalone |
| Expenses | Recurring (utilities) or one-time (repairs, tax, insurance) |

---

## 2. Tech Stack

Use **exactly** the following stack. Do not substitute libraries unless specified.

| Layer | Library / Tool | Version |
|---|---|---|
| Framework | React Native + Expo | SDK 52+ |
| Language | TypeScript | 5.x, strict mode |
| Routing | Expo Router | v4 (file-based) |
| Backend / DB | Supabase | latest JS client v2 |
| Auth | Supabase Auth (email/password + magic link) | — |
| State management | Zustand | v4+ |
| UI library | React Native Paper | v5 (Material Design 3) |
| Styling | StyleSheet API + React Native Paper theming | — |
| Forms | React Hook Form + Zod | latest |
| Charts | react-native-gifted-charts | latest |
| Animations | React Native Reanimated | v3 |
| Gestures | React Native Gesture Handler | v2 |
| Notifications | Expo Notifications (local scheduling only) | latest |
| Image picking | Expo Image Picker | latest |
| Image display | Expo Image | latest |
| Icons | Lucide React Native | latest |
| Date handling | date-fns | v3 |
| i18n | i18next + react-i18next + expo-localization | latest |
| Storage (KV) | Expo SecureStore (for tokens) | latest |
| File export | expo-print + expo-sharing | latest |
| Tab views | react-native-pager-view + react-native-tab-view | latest |

### Installation commands

```bash
npx create-expo-app@latest StanApp --template tabs
cd StanApp
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage
npx expo install react-native-paper react-native-vector-icons
npx expo install zustand
npx expo install react-hook-form zod @hookform/resolvers
npx expo install react-native-gifted-charts react-native-linear-gradient
npx expo install react-native-reanimated react-native-gesture-handler
npx expo install expo-notifications expo-device
npx expo install expo-image-picker expo-image
npx expo install lucide-react-native
npx expo install date-fns
npx expo install expo-secure-store
npx expo install expo-print expo-sharing expo-file-system
npx expo install expo-blur
npx expo install expo-localization
npm install i18next react-i18next
npx expo install react-native-pager-view react-native-tab-view
```

### tsconfig.json (strict mode)

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

> **Note:** Do **not** enable `exactOptionalPropertyTypes` — it causes excessive friction with React Hook Form, Zod, and Supabase generated nullable types.

---

## 3. Database Schema (Supabase / PostgreSQL)

Run the following SQL in the Supabase SQL Editor in this exact order.

### 3.1 Enable extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 3.2 Tables

```sql
-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  default_currency TEXT NOT NULL DEFAULT 'EUR',
  language        TEXT NOT NULL DEFAULT 'hr' CHECK (language IN ('en', 'hr')),
  theme           TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- PROPERTIES (apartments, houses, garages, other)
-- ============================================================
CREATE TABLE properties (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_property_id  UUID REFERENCES properties(id) ON DELETE SET NULL,
  type                TEXT NOT NULL DEFAULT 'apartment'
                        CHECK (type IN ('apartment', 'house', 'garage', 'other')),
  usage_status        TEXT NOT NULL DEFAULT 'personal_use'
                        CHECK (usage_status IN ('rented', 'personal_use', 'vacant')),
  name                TEXT NOT NULL,
  address             TEXT NOT NULL,
  floor               INTEGER,                    -- relevant for apartments
  area_sqm            NUMERIC(6,2),
  rent_amount         NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency            TEXT,                       -- NULL = use profile default_currency
  notes               TEXT,
  photo_url           TEXT,
  is_archived         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- A garage can only be attached to a non-garage parent
  CONSTRAINT garage_parent_check CHECK (
    parent_property_id IS NULL
    OR type = 'garage'
  )
);

CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_properties_parent ON properties(parent_property_id);
CREATE INDEX idx_properties_type ON properties(type);

-- ============================================================
-- TENANTS (only relevant when usage_status = 'rented')
-- ============================================================
CREATE TABLE tenants (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id     UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT,
  phone           TEXT,
  contract_start  DATE NOT NULL,
  contract_end    DATE,
  deposit_amount  NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EXPENSE CATEGORIES (global lookup, seeded with stable keys)
-- ============================================================
CREATE TABLE expense_categories (
  id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key     TEXT NOT NULL UNIQUE,   -- stable i18n key, e.g. 'electricity'
  icon    TEXT NOT NULL,          -- Lucide icon name string
  color   TEXT NOT NULL           -- hex color string
);

INSERT INTO expense_categories (key, icon, color) VALUES
  ('electricity',   'Zap',            '#F59E0B'),
  ('water',         'Droplets',       '#3B82F6'),
  ('gas',           'Flame',          '#EF4444'),
  ('internet',      'Wifi',           '#8B5CF6'),
  ('communal',      'Building2',      '#10B981'),
  ('insurance',     'Shield',         '#6366F1'),
  ('property_tax',  'Landmark',       '#EC4899'),
  ('maintenance',   'Wrench',         '#14B8A6'),
  ('repair',        'Hammer',         '#F97316'),
  ('other',         'MoreHorizontal', '#6B7280');

-- ============================================================
-- EXPENSES (recurring utilities + one-time costs)
-- ============================================================
CREATE TABLE expenses (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id       UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  category_id       UUID NOT NULL REFERENCES expense_categories(id),
  amount            NUMERIC(10,2) NOT NULL,
  currency          TEXT,                         -- NULL = use property/profile default
  is_recurring      BOOLEAN NOT NULL DEFAULT TRUE,
  billing_date      DATE NOT NULL,
  due_date          DATE,                         -- optional for one-time expenses
  paid_at           TIMESTAMPTZ,
  receipt_photo_url TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RENT PAYMENTS (only for rented properties)
-- ============================================================
CREATE TABLE rent_payments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id    UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  amount         NUMERIC(10,2) NOT NULL,
  currency       TEXT,                           -- NULL = use property/profile default
  payment_date   DATE,
  period_month   INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  period_year    INTEGER NOT NULL CHECK (period_year BETWEEN 2000 AND 2100),
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','late','partial')),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (property_id, tenant_id, period_month, period_year)
);
```

### 3.3 Updated_at trigger

```sql
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_properties
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_tenants
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_expenses
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_rent_payments
  BEFORE UPDATE ON rent_payments
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
```

### 3.4 Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants         ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_payments   ENABLE ROW LEVEL SECURITY;
-- expense_categories is read-only global; no RLS needed

-- ---- PROFILES ----
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---- PROPERTIES ----
CREATE POLICY "Users can view own properties"
  ON properties FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own properties"
  ON properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties"
  ON properties FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties"
  ON properties FOR DELETE
  USING (auth.uid() = user_id);

-- ---- TENANTS ----
CREATE POLICY "Users can view tenants of own properties"
  ON tenants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = tenants.property_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tenants into own properties"
  ON tenants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = tenants.property_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tenants of own properties"
  ON tenants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = tenants.property_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tenants of own properties"
  ON tenants FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = tenants.property_id AND p.user_id = auth.uid()
    )
  );

-- ---- EXPENSES ----
CREATE POLICY "Users can view expenses of own properties"
  ON expenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = expenses.property_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert expenses into own properties"
  ON expenses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = expenses.property_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update expenses of own properties"
  ON expenses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = expenses.property_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete expenses of own properties"
  ON expenses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = expenses.property_id AND p.user_id = auth.uid()
    )
  );

-- ---- RENT PAYMENTS ----
CREATE POLICY "Users can view rent payments of own properties"
  ON rent_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = rent_payments.property_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert rent payments into own properties"
  ON rent_payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = rent_payments.property_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update rent payments of own properties"
  ON rent_payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = rent_payments.property_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete rent payments of own properties"
  ON rent_payments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = rent_payments.property_id AND p.user_id = auth.uid()
    )
  );
```

### 3.5 Storage bucket (for receipt photos and property photos)

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false);

INSERT INTO storage.buckets (id, name, public)
VALUES ('property-photos', 'property-photos', true);

-- Storage RLS: only owner can upload/read receipts
CREATE POLICY "Authenticated users can upload receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'receipts' AND auth.role() = 'authenticated');

CREATE POLICY "Users can read own receipts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can upload property photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'property-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can read property photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-photos');
```

---

## 4. Internationalization (i18n)

### 4.1 Setup (`i18n/index.ts`)

Initialize i18next with `expo-localization` for device locale detection and fallback to Croatian:

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './locales/en.json';
import hr from './locales/hr.json';

const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'hr';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, hr: { translation: hr } },
  lng: deviceLanguage === 'en' ? 'en' : 'hr',
  fallbackLng: 'hr',
  interpolation: { escapeValue: false },
});

export default i18n;
```

Import `@/i18n` in `app/_layout.tsx` before any component renders.

### 4.2 Translation file structure

```
i18n/
├── index.ts
└── locales/
    ├── en.json
    └── hr.json
```

### 4.3 Translation key conventions

- Use dot notation namespaces: `dashboard.title`, `properties.addNew`, `expenses.markPaid`
- **Never hard-code user-facing strings** in components — always use `const { t } = useTranslation()`
- Expense category labels: store stable `key` in DB (`electricity`, `water`, …), translate at render time via `t(\`categories.${category.key}\`)`
- Property type labels: `t(\`propertyTypes.${property.type}\`)` → `apartment` → "Apartment" / "Stan"
- Usage status labels: `t(\`usageStatus.${property.usage_status}\`)` → `rented` → "Rented" / "U najmu"
- Date formatting: use `date-fns` with locale from i18n (`enUS` or `hr` locale object)
- Currency formatting: use `Intl.NumberFormat` with locale derived from current language (`en-GB` or `hr-HR`)

### 4.4 Required translation namespaces (minimum)

Both `en.json` and `hr.json` must include at minimum:

| Namespace | Examples |
|---|---|
| `common` | save, cancel, delete, edit, loading, retry, search |
| `auth` | login, register, forgotPassword, signOut |
| `dashboard` | title, income, expenses, netIncome, overdue |
| `properties` | title, addNew, vacant, type, usageStatus, parentProperty |
| `propertyTypes` | apartment, house, garage, other |
| `usageStatus` | rented, personal_use, vacant |
| `tenants` | title, addNew, contractExpiring, active, expired |
| `expenses` | title, addNew, recurring, oneTime, markPaid, dueDate |
| `categories` | electricity, water, gas, internet, communal, insurance, property_tax, maintenance, repair, other |
| `rent` | title, addPayment, pending, paid, late, partial |
| `reports` | title, incomeVsExpenses, breakdown, export |
| `settings` | title, language, currency, darkMode, notifications |
| `validation` | required, invalidEmail, minLength, passwordsMatch |
| `empty` | noProperties, noExpenses, noTenants |
| `errors` | generic, network, unauthorized |

### 4.5 Language persistence

- On login, load `profiles.language` and call `i18n.changeLanguage(profile.language)`
- On language change in Settings, update `profiles.language` in Supabase and call `i18n.changeLanguage()`
- Persist language choice locally in AsyncStorage as fallback for offline/unauthenticated state

---

## 5. Project Structure

Create the following complete file and folder structure. Every file listed must be created with full implementation.

```
StanApp/
├── app/
│   ├── _layout.tsx                    # Root layout, PaperProvider, i18n, auth gate
│   ├── index.tsx                      # Redirect to (auth) or (tabs)
│   ├── (auth)/
│   │   ├── _layout.tsx                # Auth stack layout
│   │   ├── login.tsx                  # Login screen
│   │   ├── register.tsx               # Register screen
│   │   └── forgot-password.tsx        # Forgot password screen
│   ├── (tabs)/
│   │   ├── _layout.tsx                # Bottom tab navigator (4 tabs)
│   │   ├── index.tsx                  # Dashboard (tab 1)
│   │   ├── properties.tsx             # Property list (tab 2)
│   │   ├── expenses.tsx               # Expenses list (tab 3)
│   │   └── reports.tsx                # Reports + charts (tab 4)
│   ├── property/
│   │   ├── [id].tsx                   # Property detail screen (tab view)
│   │   ├── new.tsx                    # Add new property
│   │   └── edit/[id].tsx              # Edit property
│   ├── tenant/
│   │   ├── [id].tsx                   # Tenant detail
│   │   ├── new.tsx                    # Add tenant (query param: propertyId)
│   │   └── edit/[id].tsx              # Edit tenant
│   ├── expense/
│   │   ├── [id].tsx                   # Expense detail
│   │   ├── new.tsx                    # Add expense (query param: propertyId)
│   │   └── edit/[id].tsx              # Edit expense
│   ├── rent/
│   │   ├── [id].tsx                   # Rent payment detail
│   │   └── new.tsx                    # Add rent payment
│   └── settings/
│       ├── index.tsx                  # Settings main screen
│       ├── profile.tsx                # Profile edit
│       └── notifications.tsx          # Notification preferences
│
├── components/
│   ├── ui/
│   │   ├── AppButton.tsx              # Custom button wrapping Paper Button
│   │   ├── AppCard.tsx                # Base card component
│   │   ├── AppTextInput.tsx           # Controlled RHF input
│   │   ├── AppDatePicker.tsx          # Date picker with iOS/Android handling
│   │   ├── AppPicker.tsx              # Dropdown picker
│   │   ├── AppBadge.tsx               # Status badge (paid/pending/late)
│   │   ├── AppSegmentedControl.tsx    # Segmented control for filters/tabs
│   │   ├── SkeletonLoader.tsx         # Generic skeleton placeholder
│   │   ├── EmptyState.tsx             # Empty state with icon + message
│   │   ├── ErrorState.tsx             # Error state with retry button
│   │   ├── ConfirmDialog.tsx          # Reusable confirmation dialog
│   │   └── Toast.tsx                  # Toast notification component
│   ├── property/
│   │   ├── PropertyCard.tsx           # Card shown in list
│   │   ├── PropertyForm.tsx           # Shared add/edit form
│   │   ├── PropertyStats.tsx          # Mini stats bar on detail screen
│   │   ├── PropertyTypeBadge.tsx      # Icon + label for property type
│   │   ├── UsageStatusBadge.tsx       # Badge for rented/personal/vacant
│   │   └── SubPropertyList.tsx        # List of attached garages/sub-properties
│   ├── tenant/
│   │   ├── TenantCard.tsx
│   │   └── TenantForm.tsx
│   ├── expense/
│   │   ├── ExpenseCard.tsx
│   │   ├── ExpenseForm.tsx
│   │   └── CategoryBadge.tsx          # Icon + colored badge for expense category
│   ├── rent/
│   │   ├── RentPaymentCard.tsx
│   │   ├── RentPaymentForm.tsx
│   │   └── MonthlyGrid.tsx            # 12-month payment grid view
│   ├── dashboard/
│   │   ├── SummaryCard.tsx            # Total income / expense cards
│   │   ├── RecentActivity.tsx         # Last 5 transactions
│   │   └── OverdueAlert.tsx           # Overdue expenses banner
│   └── reports/
│       ├── IncomeExpenseChart.tsx     # Bar chart: income vs expenses
│       ├── ExpenseBreakdown.tsx       # Pie/donut chart per category
│       └── PeriodFilter.tsx           # Month/year filter component
│
├── i18n/
│   ├── index.ts                       # i18next initialization
│   └── locales/
│       ├── en.json                    # English translations
│       └── hr.json                    # Croatian translations
│
├── lib/
│   ├── supabase.ts                    # Supabase client init
│   ├── auth.ts                        # Auth helpers (signIn, signOut, etc.)
│   └── notifications.ts              # Local notification scheduling
│
├── hooks/
│   ├── useProperties.ts               # CRUD + realtime for properties
│   ├── useTenants.ts                  # CRUD for tenants
│   ├── useExpenses.ts                 # CRUD for expenses
│   ├── useRentPayments.ts             # CRUD for rent payments
│   ├── useExpenseCategories.ts        # Fetch global categories
│   ├── useProfile.ts                  # Profile CRUD (language, currency, theme)
│   ├── useDashboardStats.ts           # Aggregated stats for dashboard
│   └── useReports.ts                  # Report data aggregation
│
├── stores/
│   ├── authStore.ts                   # Zustand: user session
│   ├── propertyStore.ts               # Zustand: properties list cache
│   └── uiStore.ts                     # Zustand: toast, loading, modal state
│
├── types/
│   ├── database.types.ts              # Auto-generated Supabase types (see section 9)
│   ├── app.types.ts                   # App-level TS interfaces and enums
│   └── form.types.ts                  # Zod schemas re-exported as types
│
├── constants/
│   ├── theme.ts                       # Colors, typography, spacing
│   └── config.ts                      # App config (currency list, property types, etc.)
│
├── utils/
│   ├── formatters.ts                  # Currency, date, period formatters (locale-aware)
│   ├── validators.ts                  # Shared Zod schemas
│   ├── export.ts                      # PDF / CSV export logic
│   └── currency.ts                    # Resolve effective currency (profile → property → row)
│
├── assets/
│   ├── images/
│   │   ├── icon.png
│   │   ├── splash.png
│   │   └── onboarding/
│   └── fonts/
│
├── .env
├── .env.example
├── app.json
├── babel.config.js
└── package.json
```

---

## 6. Key Screens — Detailed Specifications

Implement every screen listed below. Each screen must include: loading state (skeleton), empty state (when no data), error state (with retry), and pull-to-refresh where applicable. **All user-facing text must use `useTranslation()` — no hard-coded strings.**

---

### 6.1 Auth Screens — `app/(auth)/`

#### `login.tsx`
- Email + password fields (React Hook Form + Zod)
- "Sign In" button with loading state
- "Forgot password?" link → `forgot-password.tsx`
- "Don't have an account? Register" link → `register.tsx`
- On success: replace navigation with `/(tabs)/`
- Show error toast on failed login

#### `register.tsx`
- Full name, email, password, confirm password
- Zod: email valid, password min 8 chars, passwords match
- On success: profile auto-created via DB trigger with `full_name`; redirect to login with success toast
- Email confirmation notice if Supabase email confirmation is enabled

#### `forgot-password.tsx`
- Email input
- Send reset link via `supabase.auth.resetPasswordForEmail()`
- Success/error states

---

### 6.2 Dashboard — `app/(tabs)/index.tsx`

Show aggregated stats for the current month:
- Total monthly rent income (sum of `rent_payments` with `status = 'paid'`)
- Total monthly expenses (sum of `expenses` billed in current month)
- Net income (rent income minus expenses)
- Number of active properties / active tenants (tenants only on rented properties)
- Overdue expenses count (`due_date < today AND paid_at IS NULL`)
- Recent activity: last 5 expenses or payments added

Components to use:
- `SummaryCard` × 3 (Income, Expenses, Net)
- `OverdueAlert` banner if overdue count > 0
- `RecentActivity` list
- Quick action FAB: "Add Expense" / "Add Payment"

---

### 6.3 Property List — `app/(tabs)/properties.tsx`

- `FlatList` of `PropertyCard` components
- Each card shows: type icon + name, address, usage status badge, active tenant name (if rented) or status label, monthly rent (if rented), overdue expenses badge
- Filter bar: All types / Apartment / House / Garage; All usage / Rented / Personal / Vacant
- Pull to refresh
- FAB → `property/new.tsx`
- Swipe left → Archive | Delete
- Search bar at top
- Empty state: translated "You haven't added any properties yet"

---

### 6.4 Property Detail — `app/property/[id].tsx`

Use **`react-native-tab-view`** with `TabView` + `TabBar` (NOT React Native Paper Tab — it does not exist for in-screen tabs).

Tabs (dynamic based on `usage_status`):

1. **Overview** (always): type badge, usage status, name, address, area, floor (if apartment), rent amount, photo, notes, `SubPropertyList` for attached garages
2. **Tenants** (only if `usage_status = 'rented'`): tenant list with contract info and status badge
3. **Expenses** (always): expenses grouped by month, total per month, mark as paid inline
4. **Rent Payments** (only if `usage_status = 'rented'`): 12-month grid (`MonthlyGrid`)

Header: Edit button → `property/edit/[id].tsx`

If property is a garage with `parent_property_id`, show link to parent property at top.

---

### 6.5 Add/Edit Property — `app/property/new.tsx` and `app/property/edit/[id].tsx`

Form fields:
- **Property type** (required): apartment / house / garage / other — segmented control with icons
- **Usage status** (required): rented / personal use / vacant
- Name (required)
- Address (required)
- Floor (optional, shown only for `type = apartment`)
- Area m² (optional, decimal)
- Monthly rent amount (shown and required only when `usage_status = rented`)
- Parent property (optional, shown only for `type = garage`): picker of user's non-garage properties
- Notes (multiline, optional)
- Photo: Expo Image Picker, upload to Supabase storage bucket `property-photos`

Validation with Zod. Currency inherits from profile default — no per-property currency picker in v1.

On save: upsert to Supabase, invalidate property store cache, navigate back.

When changing `usage_status` away from `rented`, show confirm dialog: "Existing tenant and rent data will be hidden but not deleted."

---

### 6.6 Tenant Management (rented properties only)

#### `app/tenant/new.tsx` (receives `propertyId` as query param)
- Only accessible if parent property has `usage_status = 'rented'`
- Form fields: first name, last name, email, phone, contract start/end, deposit amount, notes

#### `app/tenant/[id].tsx`
- Tenant info display
- Contract status badge: Active (green), Expiring Soon — <30 days (yellow), Expired (red)
- List of rent payments for this tenant
- Edit and deactivate buttons

---

### 6.7 Expenses — `app/(tabs)/expenses.tsx`

- `SectionList` grouped by month-year header
- Each `ExpenseCard` shows: category icon+color (translated label), property name, amount, due date, paid/unpaid status, recurring/one-time badge
- Filter bar: All / Unpaid / Paid / Recurring / One-time; property filter; category filter
- Pull to refresh
- FAB → `expense/new.tsx`
- Swipe left: Mark as Paid (if unpaid), Delete
- Mark as paid updates `paid_at = NOW()`

#### `app/expense/new.tsx` (receives `propertyId` as query param)
Form fields:
- Property selector (pre-filled if query param provided)
- Expense category selector (icon + color, translated label)
- Amount (required, decimal)
- Recurring toggle (default: true for utility categories, false for repair/maintenance/tax)
- Billing date (date picker)
- Due date (date picker, optional when one-time)
- Receipt photo (optional, upload to `receipts` bucket)
- Notes

---

### 6.8 Rent Payments — accessible from Property Detail and Dashboard (rented properties only)

#### Add rent payment — `app/rent/new.tsx`
Form fields:
- Property selector (filtered to `usage_status = 'rented'` only)
- Tenant selector (filtered by property)
- Amount (pre-filled from property `rent_amount`)
- Period month + year (month picker + year input)
- Payment date (date picker, optional for pending)
- Status (pending / paid / late / partial)
- Notes

---

### 6.9 Reports — `app/(tabs)/reports.tsx`

Period filter at top: current month, last 3 months, last 6 months, last 12 months, custom range.

Sections:
1. **Income vs Expenses** — `IncomeExpenseChart`: grouped bar chart (monthly bars, rent income in green, expenses in red)
2. **Expense Breakdown** — `ExpenseBreakdown`: donut chart showing share of each category in selected period
3. **Per-Property Summary** — table/card list of each property showing: total rent collected, total expenses paid, net
4. **Export** button: generates PDF report using `expo-print` and shares via `expo-sharing`

> **Currency note:** Reports assume a single currency (profile `default_currency`). If mixed currencies exist, show a warning banner and group totals by currency.

---

### 6.10 Settings — `app/settings/index.tsx`

Sections:
- **Account**: display name (from `profiles.full_name`), email, change password button
- **Language**: English / Hrvatski toggle — updates `profiles.language` + `i18n.changeLanguage()`
- **Currency**: default currency selector (EUR, USD, GBP) — updates `profiles.default_currency`
- **Notifications**: toggle for due date reminders (3 days, 1 day), overdue alerts
- **Data**: Export all data (CSV), Delete account (with confirmation)
- **Appearance**: Dark mode toggle (updates `profiles.theme`)
- **About**: App version, privacy policy link, terms link
- **Sign out** button

---

## 7. Design Requirements

### Color Scheme

Implement the following palette in `constants/theme.ts`:

```typescript
export const Colors = {
  // Brand
  primary:       '#2563EB', // Blue 600 — primary actions, active tab
  primaryLight:  '#DBEAFE', // Blue 100 — light backgrounds
  accent:        '#10B981', // Emerald 500 — positive values, paid status
  warning:       '#F59E0B', // Amber 500 — upcoming due dates
  danger:        '#EF4444', // Red 500 — overdue, errors, delete

  // Surfaces (Light mode)
  background:    '#F8FAFC', // Slate 50
  surface:       '#FFFFFF',
  surfaceVariant:'#F1F5F9', // Slate 100
  border:        '#E2E8F0', // Slate 200

  // Surfaces (Dark mode)
  backgroundDark:    '#0F172A', // Slate 900
  surfaceDark:       '#1E293B', // Slate 800
  surfaceVariantDark:'#334155', // Slate 700
  borderDark:        '#475569', // Slate 600

  // Text
  textPrimary:   '#0F172A', // Slate 900
  textSecondary: '#64748B', // Slate 500
  textDisabled:  '#CBD5E1', // Slate 300
  textInverse:   '#FFFFFF',

  // Status
  statusPaid:    '#10B981',
  statusPending: '#F59E0B',
  statusLate:    '#EF4444',
  statusPartial: '#8B5CF6',

  // Property types
  typeApartment: '#2563EB',
  typeHouse:     '#10B981',
  typeGarage:    '#6B7280',
  typeOther:     '#8B5CF6',
};
```

### Typography Scale

```typescript
export const Typography = {
  displayLarge:  { fontSize: 32, fontWeight: '700', lineHeight: 40 },
  displayMedium: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  headlineLarge: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
  headlineMedium:{ fontSize: 20, fontWeight: '600', lineHeight: 28 },
  titleLarge:    { fontSize: 18, fontWeight: '600', lineHeight: 26 },
  titleMedium:   { fontSize: 16, fontWeight: '500', lineHeight: 24 },
  bodyLarge:     { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodyMedium:    { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  bodySmall:     { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  labelLarge:    { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  labelMedium:   { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  labelSmall:    { fontSize: 11, fontWeight: '500', lineHeight: 14 },
} as const;
```

### Spacing

```typescript
export const Spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
} as const;
```

### Bottom Tab Navigation

4 tabs only:

| Tab | Icon (Lucide) | Label (i18n key) |
|---|---|---|
| 1 | `LayoutDashboard` | `tabs.dashboard` |
| 2 | `Building2` | `tabs.properties` |
| 3 | `Receipt` | `tabs.expenses` |
| 4 | `BarChart3` | `tabs.reports` |

Settings accessible via header icon (gear) on Dashboard tab.

### Card Style

All cards use:
- `borderRadius: 12`
- `elevation: 2` (Paper)
- padding: `Spacing.md`
- subtle border: `1px solid Colors.border`

### Dark Mode

- Use `useColorScheme()` from React Native, overridden by `profiles.theme` when set to `light` or `dark`
- Pass appropriate Paper theme to `PaperProvider`
- All color references must go through `Colors` — never hard-code hex values in components

---

## 8. UX Requirements

Implement all of the following UX patterns:

### Swipe Actions
Use `react-native-gesture-handler` `Swipeable` component on all list items.
- Swipe left on property card → **Archive** (yellow) | **Delete** (red)
- Swipe left on expense card → **Mark Paid** (green, only if unpaid) | **Delete** (red)
- Swipe left on rent payment → **Mark Paid** | **Delete**

### Pull to Refresh
Every `FlatList` and `SectionList` must implement `RefreshControl` wired to re-fetch from Supabase.

### Skeleton Loaders
Create `SkeletonLoader` using React Native Reanimated `withRepeat` + `withTiming` shimmer animation.
- Use on: property list, expense list, dashboard stats, report charts

### Toast Notifications
Implement a global toast system via `uiStore.ts`:
```typescript
// Usage from anywhere:
useUiStore.getState().showToast({ message: t('expenses.markedPaid'), type: 'success' });
```
Toast types: `success` (green), `error` (red), `warning` (yellow), `info` (blue)
Toast auto-dismisses after 3 seconds. Positioned at bottom, above tab bar.

### Confirmation Dialogs
Use `ConfirmDialog` component (Paper `Dialog`) for all destructive actions:
- Delete property: translated message about cascading delete of tenants and expenses
- Delete tenant: translated message about deleting payment records
- Delete expense: standard confirmation
- Change usage away from rented: warn about hiding tenant/rent data
- Delete account: require typing "DELETE" to confirm

### Animations
- List item entrance: `FadeInDown` from `react-native-reanimated`
- Card press: scale to 0.97 on press in
- Tab switch: use default `react-native-tab-view` animation on Property Detail
- Modal open: `SlideInUp` from bottom
- Number changes in dashboard: animated with `react-native-reanimated` `useAnimatedProps`

---

## 9. Development Instructions for Cursor

Follow this step-by-step build order. Complete each step fully before moving to the next.

---

### Step 1 — Environment Setup

Create `.env` file:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Create `.env.example`:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Add `.env` to `.gitignore`.

---

### Step 2 — Supabase Client (`lib/supabase.ts`)

```typescript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

---

### Step 3 — Generate TypeScript Types from Supabase

After running the SQL schema in Supabase, generate types:

```bash
npx supabase gen types typescript \
  --project-id YOUR_PROJECT_ID \
  --schema public > types/database.types.ts
```

Export convenience types from `types/app.types.ts`:

```typescript
import type { Database } from './database.types';

export type Property = Database['public']['Tables']['properties']['Row'];
export type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
export type PropertyUpdate = Database['public']['Tables']['properties']['Update'];
export type Tenant = Database['public']['Tables']['tenants']['Row'];
export type Expense = Database['public']['Tables']['expenses']['Row'];
export type RentPayment = Database['public']['Tables']['rent_payments']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ExpenseCategory = Database['public']['Tables']['expense_categories']['Row'];

export type PropertyType = 'apartment' | 'house' | 'garage' | 'other';
export type UsageStatus = 'rented' | 'personal_use' | 'vacant';
export type PaymentStatus = 'pending' | 'paid' | 'late' | 'partial';
export type Language = 'en' | 'hr';
export type Theme = 'light' | 'dark' | 'system';
```

---

### Step 4 — i18n Setup (`i18n/index.ts` + locale files)

Create `i18n/index.ts` (see Section 4.1) and populate `i18n/locales/en.json` and `i18n/locales/hr.json` with all namespaces from Section 4.4.

Import `@/i18n` in `app/_layout.tsx` before rendering.

Example keys in `en.json`:
```json
{
  "tabs": {
    "dashboard": "Dashboard",
    "properties": "Properties",
    "expenses": "Expenses",
    "reports": "Reports"
  },
  "propertyTypes": {
    "apartment": "Apartment",
    "house": "House",
    "garage": "Garage",
    "other": "Other"
  },
  "usageStatus": {
    "rented": "Rented",
    "personal_use": "Personal use",
    "vacant": "Vacant"
  },
  "categories": {
    "electricity": "Electricity",
    "water": "Water",
    "gas": "Gas",
    "internet": "Internet",
    "communal": "Communal fees",
    "insurance": "Insurance",
    "property_tax": "Property tax",
    "maintenance": "Maintenance",
    "repair": "Repair",
    "other": "Other"
  }
}
```

Example keys in `hr.json`:
```json
{
  "tabs": {
    "dashboard": "Početna",
    "properties": "Nekretnine",
    "expenses": "Troškovi",
    "reports": "Izvještaji"
  },
  "propertyTypes": {
    "apartment": "Stan",
    "house": "Kuća",
    "garage": "Garaža",
    "other": "Ostalo"
  },
  "usageStatus": {
    "rented": "U najmu",
    "personal_use": "Osobna uporaba",
    "vacant": "Prazno"
  },
  "categories": {
    "electricity": "Struja",
    "water": "Voda",
    "gas": "Plin",
    "internet": "Internet",
    "communal": "Komunalija",
    "insurance": "Osiguranje",
    "property_tax": "Porez na nekretnine",
    "maintenance": "Održavanje",
    "repair": "Popravak",
    "other": "Ostalo"
  }
}
```

---

### Step 5 — Auth Store (`stores/authStore.ts`)

```typescript
import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: true,
  setSession: (session) => set({ session, user: session?.user ?? null, isLoading: false }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));
```

---

### Step 6 — Root Layout (`app/_layout.tsx`)

- Import `@/i18n` first
- Wrap with `PaperProvider` using custom theme built from `constants/theme.ts`
- Listen to `supabase.auth.onAuthStateChange` and call `authStore.setSession`
- On session established, fetch `profiles` row and apply `language` + `theme`
- Use `Slot` from Expo Router as child
- Handle initial loading state (show splash or spinner)
- Set up `GestureHandlerRootView` and `SafeAreaProvider` as outermost wrappers

---

### Step 7 — Constants and Theme

Build `constants/theme.ts` with full `Colors`, `Typography`, `Spacing` exported.

Build `constants/config.ts`:
```typescript
export const SUPPORTED_CURRENCIES = ['EUR', 'USD', 'GBP'] as const;
export const PROPERTY_TYPES = ['apartment', 'house', 'garage', 'other'] as const;
export const USAGE_STATUSES = ['rented', 'personal_use', 'vacant'] as const;
export const LANGUAGES = ['en', 'hr'] as const;
```

Build React Native Paper custom theme:

```typescript
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    secondary: Colors.accent,
    background: Colors.background,
    surface: Colors.surface,
    error: Colors.danger,
  },
};
```

---

### Step 8 — Reusable UI Components

Build all components in `components/ui/` in this order:
1. `SkeletonLoader.tsx` — animated shimmer
2. `EmptyState.tsx` — icon + title + subtitle + optional CTA button
3. `ErrorState.tsx` — error icon + message + retry button
4. `AppButton.tsx` — Paper Button wrapper with loading spinner
5. `AppTextInput.tsx` — Paper TextInput + RHF Controller + error display
6. `AppDatePicker.tsx` — cross-platform date picker
7. `AppSegmentedControl.tsx` — segmented control for filters
8. `ConfirmDialog.tsx` — Paper Dialog with title, message, confirm/cancel
9. `Toast.tsx` + toast system wired to `uiStore`
10. `AppBadge.tsx` — colored pill badge

---

### Step 9 — Data Hooks

Build each hook using Supabase JS client v2. Pattern for each hook:

```typescript
// Example: useProperties.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { Property } from '@/types/app.types';

export function useProperties() {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('properties')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setProperties(data ?? []);
    setIsLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (values: PropertyInsert) => {
    const { data, error: err } = await supabase.from('properties').insert(values).select().single();
    if (err) throw err;
    setProperties(prev => [data, ...prev]);
    return data;
  };

  const update = async (id: string, values: PropertyUpdate) => {
    const { data, error: err } = await supabase.from('properties').update(values).eq('id', id).select().single();
    if (err) throw err;
    setProperties(prev => prev.map(p => p.id === id ? data : p));
    return data;
  };

  const remove = async (id: string) => {
    const { error: err } = await supabase.from('properties').delete().eq('id', id);
    if (err) throw err;
    setProperties(prev => prev.filter(p => p.id !== id));
  };

  return { properties, isLoading, error, refetch: fetch, create, update, remove };
}
```

Build the same pattern for: `useTenants`, `useExpenses`, `useRentPayments`, `useExpenseCategories`, `useProfile`.

`useProfile` must expose: `profile`, `updateProfile`, `updateLanguage`, `updateCurrency`, `updateTheme`.

---

### Step 10 — Screens (build in this order)

1. i18n locale files (complete both en + hr)
2. Dashboard screen
3. Property list screen
4. Property detail screen (with react-native-tab-view tabs)
5. Add/Edit Property screens
6. Tenant screens (rented properties only)
7. Expenses list screen
8. Add/Edit Expense screens
9. Rent Payment screens
10. Reports screen (charts last)
11. Settings screens (language + currency toggles)

---

### Step 11 — Local Notifications (`lib/notifications.ts`)

Use **local scheduled notifications only** — no Expo push token registration (no server-side push infrastructure exists in v1).

```typescript
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleExpenseDueReminder(
  expenseId: string,
  dueDate: Date,
  categoryKey: string,
  amount: number,
) {
  const threeDaysBefore = new Date(dueDate);
  threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
  if (threeDaysBefore <= new Date()) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Expense Due Soon',  // use i18n key at call site
      body: `${categoryKey} — ${amount}`,
      data: { expenseId, type: 'expense_due' },
    },
    trigger: { date: threeDaysBefore },
  });
}

export async function cancelExpenseReminders(expenseId: string) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    if (notification.content.data?.expenseId === expenseId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}
```

Schedule reminders when an expense with a `due_date` is created/updated. Cancel when marked paid.

---

### Step 12 — Export Utility (`utils/export.ts`)

```typescript
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';
import type { TFunction } from 'i18next';

export async function exportReportAsPDF(data: ReportData, t: TFunction) {
  const html = generateReportHTML(data, t);
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
}

function generateReportHTML(data: ReportData, t: TFunction): string {
  return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><style>
        body { font-family: Arial; padding: 20px; }
        h1 { color: #2563EB; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; border: 1px solid #E2E8F0; text-align: left; }
        th { background: #F1F5F9; }
      </style></head>
      <body>
        <h1>${t('reports.title')} — StanApp</h1>
        <p>${format(new Date(), 'dd.MM.yyyy HH:mm')}</p>
      </body>
    </html>
  `;
}
```

---

### Step 13 — Zod Validation Schemas (`utils/validators.ts`)

```typescript
import { z } from 'zod';

export const propertySchema = z.object({
  type: z.enum(['apartment', 'house', 'garage', 'other']),
  usage_status: z.enum(['rented', 'personal_use', 'vacant']),
  parent_property_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1, 'validation.required').max(100),
  address: z.string().min(1, 'validation.required').max(255),
  floor: z.number().int().optional().nullable(),
  area_sqm: z.number().positive().optional().nullable(),
  rent_amount: z.number().min(0),
  notes: z.string().max(1000).optional().nullable(),
}).refine(
  (data) => data.type !== 'garage' || !data.parent_property_id || data.type === 'garage',
  { message: 'validation.garageParentInvalid', path: ['parent_property_id'] }
).refine(
  (data) => data.usage_status !== 'rented' || data.rent_amount > 0,
  { message: 'validation.rentRequired', path: ['rent_amount'] }
);

export const tenantSchema = z.object({
  first_name: z.string().min(1, 'validation.required').max(100),
  last_name: z.string().min(1, 'validation.required').max(100),
  email: z.string().email('validation.invalidEmail').optional().or(z.literal('')),
  phone: z.string().max(20).optional().nullable(),
  contract_start: z.string().min(1, 'validation.required'),
  contract_end: z.string().optional().nullable(),
  deposit_amount: z.number().min(0),
  notes: z.string().max(1000).optional().nullable(),
});

export const expenseSchema = z.object({
  property_id: z.string().uuid('validation.required'),
  category_id: z.string().uuid('validation.required'),
  amount: z.number().positive('validation.positiveAmount'),
  is_recurring: z.boolean(),
  billing_date: z.string().min(1, 'validation.required'),
  due_date: z.string().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const rentPaymentSchema = z.object({
  property_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  amount: z.number().positive(),
  period_month: z.number().int().min(1).max(12),
  period_year: z.number().int().min(2000).max(2100),
  status: z.enum(['pending', 'paid', 'late', 'partial']),
  payment_date: z.string().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const profileSchema = z.object({
  full_name: z.string().min(1, 'validation.required').max(100),
  default_currency: z.enum(['EUR', 'USD', 'GBP']),
  language: z.enum(['en', 'hr']),
  theme: z.enum(['light', 'dark', 'system']),
});

export const loginSchema = z.object({
  email: z.string().email('validation.invalidEmail'),
  password: z.string().min(8, 'validation.minLength'),
});

export const registerSchema = z.object({
  full_name: z.string().min(1, 'validation.required'),
  email: z.string().email('validation.invalidEmail'),
  password: z.string().min(8, 'validation.minLength'),
  confirm_password: z.string(),
}).refine(data => data.password === data.confirm_password, {
  message: 'validation.passwordsMatch',
  path: ['confirm_password'],
});
```

> Validation error messages are i18n keys — resolve them with `t(error.message)` in form components.

---

### Step 14 — Formatters and Currency (`utils/formatters.ts`, `utils/currency.ts`)

```typescript
// utils/currency.ts
import type { Profile, Property } from '@/types/app.types';

export function resolveCurrency(
  profile: Profile | null,
  property?: Property | null,
  rowCurrency?: string | null,
): string {
  return rowCurrency ?? property?.currency ?? profile?.default_currency ?? 'EUR';
}
```

```typescript
// utils/formatters.ts
import { format, parseISO } from 'date-fns';
import { enUS, hr } from 'date-fns/locale';
import type { Language } from '@/types/app.types';

const dateLocales = { en: enUS, hr };

export function formatCurrency(amount: number, currency = 'EUR', language: Language = 'hr'): string {
  const locale = language === 'en' ? 'en-GB' : 'hr-HR';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string, language: Language = 'hr'): string {
  return format(parseISO(dateString), 'dd.MM.yyyy', { locale: dateLocales[language] });
}

export function formatPeriod(month: number, year: number, language: Language = 'hr'): string {
  const date = new Date(year, month - 1);
  return format(date, 'MMMM yyyy', { locale: dateLocales[language] });
}

export function getStatusColor(status: 'paid' | 'pending' | 'late' | 'partial'): string {
  const map = {
    paid: '#10B981',
    pending: '#F59E0B',
    late: '#EF4444',
    partial: '#8B5CF6',
  };
  return map[status];
}

export function isOverdue(dueDateString: string | null | undefined, paidAt: string | null): boolean {
  if (!dueDateString || paidAt) return false;
  return new Date(dueDateString) < new Date();
}
```

---

### Step 15 — babel.config.js (required for Reanimated)

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // MUST be last plugin
    ],
  };
};
```

---

### Step 16 — app.json configuration

```json
{
  "expo": {
    "name": "StanApp",
    "slug": "stanapp",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "stanapp",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#2563EB"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.yourname.stanapp",
      "infoPlist": {
        "NSCameraUsageDescription": "Used to photograph expense receipts",
        "NSPhotoLibraryUsageDescription": "Used to select property and receipt photos"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#2563EB"
      },
      "package": "com.yourname.stanapp",
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE",
        "POST_NOTIFICATIONS"
      ]
    },
    "plugins": [
      "expo-router",
      "expo-notifications",
      "expo-localization",
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow StanApp to access your photos.",
          "cameraPermission": "Allow StanApp to use the camera."
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

---

## 10. Testing Approach

### Unit Tests
- Use Jest (built into Expo)
- Test all Zod schemas in `utils/validators.ts`
- Test all formatter functions in `utils/formatters.ts` (both `en` and `hr` locales)
- Test `resolveCurrency` in `utils/currency.ts`
- Test Zustand stores with `@testing-library/react-hooks`

### Integration Tests
- Use `@testing-library/react-native`
- Test each form component: renders correctly, validates on submit, shows error messages
- Test language switch updates visible labels
- Mock Supabase client with `jest.mock('@/lib/supabase')`

### E2E (optional, recommended before release)
- Use Maestro or Detox
- Flows to test: sign in → add property (house) → add expense → mark paid → view dashboard
- Flows to test: add rented apartment → add tenant → add rent payment → view reports
- Flows to test: switch language to Croatian → verify labels

### Test file locations
```
__tests__/
├── validators.test.ts
├── formatters.test.ts
├── currency.test.ts
├── stores/
│   └── authStore.test.ts
└── components/
    ├── PropertyForm.test.tsx
    └── ExpenseForm.test.tsx
```

---

## 11. Common Patterns & Code Conventions

### Always use RLS-safe queries
Never manually filter by `user_id` in queries — RLS handles it. Trust RLS policies.

### i18n pattern in components
```typescript
import { useTranslation } from 'react-i18next';

export function PropertyCard({ property }: { property: Property }) {
  const { t } = useTranslation();
  return (
    <AppCard>
      <Text>{property.name}</Text>
      <AppBadge label={t(`propertyTypes.${property.type}`)} />
      <AppBadge label={t(`usageStatus.${property.usage_status}`)} />
    </AppCard>
  );
}
```

### Error handling pattern
```typescript
const { data, error } = await supabase.from('properties').select('*');
if (error) {
  useUiStore.getState().showToast({ message: error.message, type: 'error' });
  return;
}
```

### Loading pattern in components
```typescript
const { t } = useTranslation();
if (isLoading) return <SkeletonLoader count={4} />;
if (error) return <ErrorState message={error} onRetry={refetch} />;
if (properties.length === 0) return <EmptyState title={t('empty.noProperties')} subtitle={t('empty.noPropertiesHint')} />;
```

### Navigation pattern
```typescript
import { router } from 'expo-router';
router.push('/property/new');
router.push({ pathname: '/tenant/new', params: { propertyId: id } });
router.back();
```

### Image upload pattern
```typescript
const uploadReceiptPhoto = async (uri: string, expenseId: string): Promise<string> => {
  const ext = uri.split('.').pop() ?? 'jpg';
  const fileName = `${user.id}/${expenseId}.${ext}`;
  const response = await fetch(uri);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const { error } = await supabase.storage
    .from('receipts')
    .upload(fileName, arrayBuffer, { contentType: `image/${ext}`, upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('receipts').getPublicUrl(fileName);
  return data.publicUrl;
};
```

### Conditional UI for rented properties
```typescript
const isRented = property.usage_status === 'rented';
// Only show tenant/rent tabs and FAB actions when isRented === true
```

---

## 12. Final Checklist Before First Run

- [ ] `.env` file created with valid Supabase URL and anon key
- [ ] SQL schema executed in Supabase SQL Editor (profiles, properties, tenants, expense_categories, expenses, rent_payments, triggers, RLS, storage)
- [ ] TypeScript types generated from Supabase and saved to `types/database.types.ts`
- [ ] `i18n/index.ts` initialized and imported in root layout
- [ ] `i18n/locales/en.json` and `i18n/locales/hr.json` populated with all required namespaces
- [ ] Language switch in Settings updates both `profiles.language` and `i18n.changeLanguage()`
- [ ] `babel.config.js` has `react-native-reanimated/plugin` as last plugin
- [ ] `app.json` has correct `scheme` set for deep linking and `expo-localization` plugin
- [ ] All packages installed: run `npx expo install` to fix version mismatches
- [ ] Run `npx expo start` — resolve any missing peer dependencies
- [ ] Test auth flow on physical device or simulator
- [ ] Verify RLS works: create two test users and confirm they cannot see each other's data
- [ ] Test property types: add apartment, house, standalone garage, garage attached to apartment
- [ ] Test usage statuses: rented property shows tenant/rent tabs; personal_use property hides them
- [ ] Test language switch: all visible labels update between English and Croatian
- [ ] Test local notification permission flow on physical device

---

*End of StanApp Cursor Prompt — Total scope: ~16 screens, 35+ components, 8 data hooks, full Supabase backend with RLS, bilingual UI (en/hr).*
