-- Property membership + email invites (owner / manager / tenant)

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

CREATE TRIGGER set_updated_at_property_members
  BEFORE UPDATE ON property_members
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Membership helpers (SECURITY DEFINER to avoid RLS recursion)
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

-- Backfill existing property owners as members
INSERT INTO property_members (property_id, user_id, role, status)
SELECT p.id, p.user_id, 'owner', 'active'
FROM properties p
WHERE NOT EXISTS (
  SELECT 1
  FROM property_members pm
  WHERE pm.property_id = p.id
    AND pm.user_id = p.user_id
    AND pm.status = 'active'
);

-- RLS
ALTER TABLE property_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own properties" ON properties;
DROP POLICY IF EXISTS "Users can insert own properties" ON properties;
DROP POLICY IF EXISTS "Users can update own properties" ON properties;
DROP POLICY IF EXISTS "Users can delete own properties" ON properties;

DROP POLICY IF EXISTS "Users can view tenants of own properties" ON tenants;
DROP POLICY IF EXISTS "Users can insert tenants into own properties" ON tenants;
DROP POLICY IF EXISTS "Users can update tenants of own properties" ON tenants;
DROP POLICY IF EXISTS "Users can delete tenants of own properties" ON tenants;

DROP POLICY IF EXISTS "Users can view expenses of own properties" ON expenses;
DROP POLICY IF EXISTS "Users can insert expenses into own properties" ON expenses;
DROP POLICY IF EXISTS "Users can update expenses of own properties" ON expenses;
DROP POLICY IF EXISTS "Users can delete expenses of own properties" ON expenses;

DROP POLICY IF EXISTS "Users can view rent payments of own properties" ON rent_payments;
DROP POLICY IF EXISTS "Users can insert rent payments into own properties" ON rent_payments;
DROP POLICY IF EXISTS "Users can update rent payments of own properties" ON rent_payments;
DROP POLICY IF EXISTS "Users can delete rent payments of own properties" ON rent_payments;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Users can view own or co-member profiles" ON profiles
  FOR SELECT USING (
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

CREATE POLICY "Members can view properties" ON properties
  FOR SELECT USING (is_property_member(id));

CREATE POLICY "Users can insert own properties" ON properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners and managers can update properties" ON properties
  FOR UPDATE
  USING (is_property_member(id, ARRAY['owner', 'manager']))
  WITH CHECK (is_property_member(id, ARRAY['owner', 'manager']));

CREATE POLICY "Primary owners can delete properties" ON properties
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Members can view tenants" ON tenants
  FOR SELECT USING (is_property_member(property_id));

CREATE POLICY "Owners and managers can insert tenants" ON tenants
  FOR INSERT WITH CHECK (is_property_member(property_id, ARRAY['owner', 'manager']));

CREATE POLICY "Owners and managers can update tenants" ON tenants
  FOR UPDATE
  USING (is_property_member(property_id, ARRAY['owner', 'manager']))
  WITH CHECK (is_property_member(property_id, ARRAY['owner', 'manager']));

CREATE POLICY "Owners and managers can delete tenants" ON tenants
  FOR DELETE USING (is_property_member(property_id, ARRAY['owner', 'manager']));

CREATE POLICY "Members can view expenses" ON expenses
  FOR SELECT USING (is_property_member(property_id));

CREATE POLICY "Owners and managers can insert expenses" ON expenses
  FOR INSERT WITH CHECK (is_property_member(property_id, ARRAY['owner', 'manager']));

CREATE POLICY "Owners and managers can update expenses" ON expenses
  FOR UPDATE
  USING (is_property_member(property_id, ARRAY['owner', 'manager']))
  WITH CHECK (is_property_member(property_id, ARRAY['owner', 'manager']));

CREATE POLICY "Owners and managers can delete expenses" ON expenses
  FOR DELETE USING (is_property_member(property_id, ARRAY['owner', 'manager']));

CREATE POLICY "Members can view rent payments" ON rent_payments
  FOR SELECT USING (is_property_member(property_id));

CREATE POLICY "Owners and managers can insert rent payments" ON rent_payments
  FOR INSERT WITH CHECK (is_property_member(property_id, ARRAY['owner', 'manager']));

CREATE POLICY "Owners and managers can update rent payments" ON rent_payments
  FOR UPDATE
  USING (is_property_member(property_id, ARRAY['owner', 'manager']))
  WITH CHECK (is_property_member(property_id, ARRAY['owner', 'manager']));

CREATE POLICY "Owners and managers can delete rent payments" ON rent_payments
  FOR DELETE USING (is_property_member(property_id, ARRAY['owner', 'manager']));

CREATE POLICY "Members can view property members" ON property_members
  FOR SELECT USING (is_property_member(property_id));

CREATE POLICY "Owners can insert property members" ON property_members
  FOR INSERT WITH CHECK (is_property_owner(property_id));

CREATE POLICY "Owners can update property members" ON property_members
  FOR UPDATE
  USING (is_property_owner(property_id))
  WITH CHECK (is_property_owner(property_id));

CREATE POLICY "Owners can delete property members" ON property_members
  FOR DELETE USING (is_property_owner(property_id));

CREATE POLICY "Owners can view property invites" ON property_invites
  FOR SELECT USING (is_property_owner(property_id));

CREATE POLICY "Owners can insert property invites" ON property_invites
  FOR INSERT WITH CHECK (is_property_owner(property_id));

CREATE POLICY "Owners can update property invites" ON property_invites
  FOR UPDATE
  USING (is_property_owner(property_id))
  WITH CHECK (is_property_owner(property_id));

CREATE POLICY "Owners can delete property invites" ON property_invites
  FOR DELETE USING (is_property_owner(property_id));

GRANT SELECT, INSERT, UPDATE, DELETE ON property_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON property_invites TO authenticated;
GRANT EXECUTE ON FUNCTION is_property_member(UUID, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION is_property_owner(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION accept_pending_invites_for_user() TO authenticated;
