-- Run in Supabase SQL Editor in order

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  default_currency TEXT NOT NULL DEFAULT 'EUR',
  language        TEXT NOT NULL DEFAULT 'hr' CHECK (language IN ('en', 'hr')),
  theme           TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
  floor               INTEGER,
  area_sqm            NUMERIC(6,2),
  rent_amount         NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency            TEXT,
  notes               TEXT,
  photo_url           TEXT,
  is_archived         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT garage_parent_check CHECK (
    parent_property_id IS NULL OR type = 'garage'
  )
);

CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_properties_parent ON properties(parent_property_id);

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

CREATE TABLE expense_categories (
  id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key     TEXT NOT NULL UNIQUE,
  icon    TEXT NOT NULL,
  color   TEXT NOT NULL
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

CREATE TABLE expenses (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id       UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  category_id       UUID NOT NULL REFERENCES expense_categories(id),
  amount            NUMERIC(10,2) NOT NULL,
  currency          TEXT,
  is_recurring      BOOLEAN NOT NULL DEFAULT TRUE,
  billing_date      DATE NOT NULL,
  due_date          DATE,
  paid_at           TIMESTAMPTZ,
  receipt_photo_url TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rent_payments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id    UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  amount         NUMERIC(10,2) NOT NULL,
  currency       TEXT,
  payment_date   DATE,
  period_month   INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  period_year    INTEGER NOT NULL CHECK (period_year BETWEEN 2000 AND 2100),
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','late','partial')),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (property_id, tenant_id, period_month, period_year)
);

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_properties BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_tenants BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_expenses BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_rent_payments BEFORE UPDATE ON rent_payments FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own properties" ON properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own properties" ON properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own properties" ON properties FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own properties" ON properties FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view tenants of own properties" ON tenants FOR SELECT USING (EXISTS (SELECT 1 FROM properties p WHERE p.id = tenants.property_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can insert tenants into own properties" ON tenants FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM properties p WHERE p.id = tenants.property_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can update tenants of own properties" ON tenants FOR UPDATE USING (EXISTS (SELECT 1 FROM properties p WHERE p.id = tenants.property_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can delete tenants of own properties" ON tenants FOR DELETE USING (EXISTS (SELECT 1 FROM properties p WHERE p.id = tenants.property_id AND p.user_id = auth.uid()));

CREATE POLICY "Users can view expenses of own properties" ON expenses FOR SELECT USING (EXISTS (SELECT 1 FROM properties p WHERE p.id = expenses.property_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can insert expenses into own properties" ON expenses FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM properties p WHERE p.id = expenses.property_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can update expenses of own properties" ON expenses FOR UPDATE USING (EXISTS (SELECT 1 FROM properties p WHERE p.id = expenses.property_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can delete expenses of own properties" ON expenses FOR DELETE USING (EXISTS (SELECT 1 FROM properties p WHERE p.id = expenses.property_id AND p.user_id = auth.uid()));

CREATE POLICY "Users can view rent payments of own properties" ON rent_payments FOR SELECT USING (EXISTS (SELECT 1 FROM properties p WHERE p.id = rent_payments.property_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can insert rent payments into own properties" ON rent_payments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM properties p WHERE p.id = rent_payments.property_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can update rent payments of own properties" ON rent_payments FOR UPDATE USING (EXISTS (SELECT 1 FROM properties p WHERE p.id = rent_payments.property_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can delete rent payments of own properties" ON rent_payments FOR DELETE USING (EXISTS (SELECT 1 FROM properties p WHERE p.id = rent_payments.property_id AND p.user_id = auth.uid()));

INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('property-photos', 'property-photos', true);

CREATE POLICY "Authenticated users can upload receipts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'receipts' AND auth.role() = 'authenticated');
CREATE POLICY "Users can read own receipts" ON storage.objects FOR SELECT USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Authenticated users can upload property photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'property-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Anyone can read property photos" ON storage.objects FOR SELECT USING (bucket_id = 'property-photos');
