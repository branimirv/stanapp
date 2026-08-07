-- INSERT ... RETURNING evaluates SELECT RLS before AFTER INSERT triggers run.
-- Membership is added in on_property_created_add_owner, so creators could not
-- read the row they just inserted (.insert().select().single() → PGRST116).
-- Allow primary owners via properties.user_id in addition to membership.

DROP POLICY IF EXISTS "Members can view properties" ON properties;

CREATE POLICY "Members can view properties" ON properties
  FOR SELECT USING (
    auth.uid() = user_id
    OR is_property_member(id)
  );
