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

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(split_part(NEW.email, '@', 1), ''),
      'User'
    )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

GRANT USAGE ON SCHEMA public TO postgres, supabase_auth_admin;
GRANT ALL ON TABLE public.profiles TO postgres, supabase_auth_admin;

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
                        CHECK (usage_status IN ('rented', 'personal_use', 'vacant', 'in_renovation')),
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

CREATE TABLE property_members (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id  UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role         TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'tenant')),
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX property_members_property_user_active_unique
  ON property_members (property_id, user_id)
  WHERE status = 'active';

CREATE INDEX idx_property_members_user_id ON property_members (user_id);
CREATE INDEX idx_property_members_property_id ON property_members (property_id);

CREATE TABLE property_invites (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id     UUID NOT NULL DEFAULT uuid_generate_v4(),
  property_id  UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  role         TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'tenant')),
  invited_by   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token        UUID NOT NULL DEFAULT uuid_generate_v4(),
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX property_invites_property_email_pending_unique
  ON property_invites (property_id, lower(email))
  WHERE status = 'pending';

CREATE INDEX idx_property_invites_email ON property_invites (lower(email));
CREATE INDEX idx_property_invites_batch_id ON property_invites (batch_id);
CREATE INDEX idx_property_invites_property_id ON property_invites (property_id);

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
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key      TEXT NOT NULL,
  name     TEXT,
  icon     TEXT NOT NULL,
  color    TEXT NOT NULL,
  type     TEXT NOT NULL DEFAULT 'regular'
             CHECK (type IN ('regular', 'irregular'))
);

CREATE UNIQUE INDEX expense_categories_global_key_unique
  ON expense_categories (key)
  WHERE user_id IS NULL;
CREATE UNIQUE INDEX expense_categories_user_key_unique
  ON expense_categories (user_id, key);

INSERT INTO expense_categories (key, icon, color, type) VALUES
  ('electricity',   'Zap',            '#F59E0B', 'regular'),
  ('water',         'Droplets',       '#3B82F6', 'regular'),
  ('gas',           'Flame',          '#EF4444', 'regular'),
  ('internet',      'Wifi',           '#8B5CF6', 'regular'),
  ('communal',      'Building2',      '#10B981', 'regular'),
  ('insurance',     'Shield',         '#6366F1', 'regular'),
  ('property_tax',  'Landmark',       '#EC4899', 'regular'),
  ('maintenance',   'Wrench',         '#14B8A6', 'irregular'),
  ('repair',        'Hammer',         '#F97316', 'irregular'),
  ('other',         'MoreHorizontal', '#6B7280', 'irregular');

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
CREATE TRIGGER set_updated_at_property_members BEFORE UPDATE ON property_members FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_tenants BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_expenses BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_rent_payments BEFORE UPDATE ON rent_payments FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE OR REPLACE FUNCTION is_property_member(
  p_property_id UUID,
  p_roles TEXT[] DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM property_members pm
    WHERE pm.property_id = p_property_id
      AND pm.user_id = auth.uid()
      AND pm.status = 'active'
      AND (p_roles IS NULL OR pm.role = ANY (p_roles))
  );
$$;

CREATE OR REPLACE FUNCTION is_property_owner(p_property_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT is_property_member(p_property_id, ARRAY['owner']::TEXT[]);
$$;

CREATE OR REPLACE FUNCTION accept_pending_invites_for_user()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  accepted_count INTEGER := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN 0;
  END IF;

  SELECT lower(u.email) INTO user_email
  FROM auth.users u
  WHERE u.id = auth.uid();

  IF user_email IS NULL OR user_email = '' THEN
    RETURN 0;
  END IF;

  WITH pending AS (
    SELECT pi.id, pi.property_id, pi.role
    FROM property_invites pi
    WHERE lower(pi.email) = user_email
      AND pi.status = 'pending'
      AND pi.expires_at > NOW()
      AND NOT EXISTS (
        SELECT 1
        FROM property_members pm
        WHERE pm.property_id = pi.property_id
          AND pm.user_id = auth.uid()
          AND pm.status = 'active'
      )
  ),
  inserted AS (
    INSERT INTO property_members (property_id, user_id, role, status)
    SELECT p.property_id, auth.uid(), p.role, 'active'
    FROM pending p
    RETURNING id
  ),
  updated AS (
    UPDATE property_invites pi
    SET status = 'accepted'
    WHERE pi.id IN (SELECT id FROM pending)
       OR (
         lower(pi.email) = user_email
         AND pi.status = 'pending'
         AND pi.expires_at > NOW()
         AND EXISTS (
           SELECT 1
           FROM property_members pm
           WHERE pm.property_id = pi.property_id
             AND pm.user_id = auth.uid()
             AND pm.status = 'active'
         )
       )
    RETURNING pi.id
  )
  SELECT count(*)::INTEGER INTO accepted_count FROM updated;

  UPDATE property_invites
  SET status = 'expired'
  WHERE lower(email) = user_email
    AND status = 'pending'
    AND expires_at <= NOW();

  RETURN accepted_count;
END;
$$;

CREATE OR REPLACE FUNCTION add_property_creator_as_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM property_members pm
    WHERE pm.property_id = NEW.id
      AND pm.user_id = NEW.user_id
      AND pm.status = 'active'
  ) THEN
    INSERT INTO property_members (property_id, user_id, role, status)
    VALUES (NEW.id, NEW.user_id, 'owner', 'active');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_property_created_add_owner
  AFTER INSERT ON properties
  FOR EACH ROW EXECUTE FUNCTION add_property_creator_as_owner();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view expense categories" ON expense_categories FOR SELECT TO authenticated USING (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Users can insert own expense categories" ON expense_categories FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own expense categories" ON expense_categories FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can view own or co-member profiles" ON profiles FOR SELECT USING (
  auth.uid() = id
  OR EXISTS (
    SELECT 1
    FROM property_members my_m
    JOIN property_members their_m ON their_m.property_id = my_m.property_id
    WHERE my_m.user_id = auth.uid()
      AND my_m.status = 'active'
      AND their_m.user_id = profiles.id
      AND their_m.status = 'active'
  )
);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Members can view properties" ON properties FOR SELECT USING (is_property_member(id));
CREATE POLICY "Users can insert own properties" ON properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners and managers can update properties" ON properties
  FOR UPDATE
  USING (is_property_member(id, ARRAY['owner', 'manager']))
  WITH CHECK (is_property_member(id, ARRAY['owner', 'manager']));
CREATE POLICY "Primary owners can delete properties" ON properties FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Members can view property members" ON property_members FOR SELECT USING (is_property_member(property_id));
CREATE POLICY "Owners can insert property members" ON property_members FOR INSERT WITH CHECK (is_property_owner(property_id));
CREATE POLICY "Owners can update property members" ON property_members
  FOR UPDATE USING (is_property_owner(property_id)) WITH CHECK (is_property_owner(property_id));
CREATE POLICY "Owners can delete property members" ON property_members FOR DELETE USING (is_property_owner(property_id));

CREATE POLICY "Owners can view property invites" ON property_invites FOR SELECT USING (is_property_owner(property_id));
CREATE POLICY "Owners can insert property invites" ON property_invites FOR INSERT WITH CHECK (is_property_owner(property_id));
CREATE POLICY "Owners can update property invites" ON property_invites
  FOR UPDATE USING (is_property_owner(property_id)) WITH CHECK (is_property_owner(property_id));
CREATE POLICY "Owners can delete property invites" ON property_invites FOR DELETE USING (is_property_owner(property_id));

CREATE POLICY "Members can view tenants" ON tenants FOR SELECT USING (is_property_member(property_id));
CREATE POLICY "Owners and managers can insert tenants" ON tenants FOR INSERT WITH CHECK (is_property_member(property_id, ARRAY['owner', 'manager']));
CREATE POLICY "Owners and managers can update tenants" ON tenants
  FOR UPDATE USING (is_property_member(property_id, ARRAY['owner', 'manager'])) WITH CHECK (is_property_member(property_id, ARRAY['owner', 'manager']));
CREATE POLICY "Owners and managers can delete tenants" ON tenants FOR DELETE USING (is_property_member(property_id, ARRAY['owner', 'manager']));

CREATE POLICY "Members can view expenses" ON expenses FOR SELECT USING (is_property_member(property_id));
CREATE POLICY "Owners and managers can insert expenses" ON expenses FOR INSERT WITH CHECK (is_property_member(property_id, ARRAY['owner', 'manager']));
CREATE POLICY "Owners and managers can update expenses" ON expenses
  FOR UPDATE USING (is_property_member(property_id, ARRAY['owner', 'manager'])) WITH CHECK (is_property_member(property_id, ARRAY['owner', 'manager']));
CREATE POLICY "Owners and managers can delete expenses" ON expenses FOR DELETE USING (is_property_member(property_id, ARRAY['owner', 'manager']));

CREATE POLICY "Members can view rent payments" ON rent_payments FOR SELECT USING (is_property_member(property_id));
CREATE POLICY "Owners and managers can insert rent payments" ON rent_payments FOR INSERT WITH CHECK (is_property_member(property_id, ARRAY['owner', 'manager']));
CREATE POLICY "Owners and managers can update rent payments" ON rent_payments
  FOR UPDATE USING (is_property_member(property_id, ARRAY['owner', 'manager'])) WITH CHECK (is_property_member(property_id, ARRAY['owner', 'manager']));
CREATE POLICY "Owners and managers can delete rent payments" ON rent_payments FOR DELETE USING (is_property_member(property_id, ARRAY['owner', 'manager']));

GRANT SELECT, INSERT, UPDATE, DELETE ON property_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON property_invites TO authenticated;
GRANT EXECUTE ON FUNCTION is_property_member(UUID, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION is_property_owner(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION accept_pending_invites_for_user() TO authenticated;

INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('property-photos', 'property-photos', true);

CREATE POLICY "Authenticated users can upload receipts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'receipts' AND auth.role() = 'authenticated');
CREATE POLICY "Users can read own receipts" ON storage.objects FOR SELECT USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Authenticated users can upload property photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'property-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Anyone can read property photos" ON storage.objects FOR SELECT USING (bucket_id = 'property-photos');
