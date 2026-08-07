-- Harden membership: protect primary + last owner; limit tenant financial reads.

CREATE OR REPLACE FUNCTION protect_property_member_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  primary_owner_id UUID;
  active_owner_count INTEGER;
BEGIN
  SELECT p.user_id INTO primary_owner_id
  FROM properties p
  WHERE p.id = OLD.property_id;

  -- Never revoke or demote the primary owner (properties.user_id).
  IF primary_owner_id IS NOT NULL AND OLD.user_id = primary_owner_id THEN
    IF NEW.status = 'revoked' AND OLD.status IS DISTINCT FROM 'revoked' THEN
      RAISE EXCEPTION 'Cannot revoke the primary property owner'
        USING ERRCODE = 'P0001';
    END IF;
    IF NEW.role IS DISTINCT FROM 'owner' AND OLD.role = 'owner' THEN
      RAISE EXCEPTION 'Cannot demote the primary property owner'
        USING ERRCODE = 'P0001';
    END IF;
  END IF;

  -- Never revoke/demote the last remaining active owner.
  IF OLD.role = 'owner' AND OLD.status = 'active'
     AND (
       (NEW.status = 'revoked' AND OLD.status IS DISTINCT FROM 'revoked')
       OR (NEW.role IS DISTINCT FROM 'owner')
     ) THEN
    SELECT count(*)::INTEGER INTO active_owner_count
    FROM property_members pm
    WHERE pm.property_id = OLD.property_id
      AND pm.status = 'active'
      AND pm.role = 'owner'
      AND pm.id IS DISTINCT FROM OLD.id;

    IF active_owner_count = 0 THEN
      RAISE EXCEPTION 'Cannot remove the last property owner'
        USING ERRCODE = 'P0001';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_property_member_changes ON property_members;
CREATE TRIGGER protect_property_member_changes
  BEFORE UPDATE ON property_members
  FOR EACH ROW
  EXECUTE FUNCTION protect_property_member_changes();

-- Membership role "tenant" is read-only co-access — no financial SELECT.
DROP POLICY IF EXISTS "Members can view expenses" ON expenses;
CREATE POLICY "Owners and managers can view expenses" ON expenses
  FOR SELECT USING (is_property_member(property_id, ARRAY['owner', 'manager']));

DROP POLICY IF EXISTS "Members can view rent payments" ON rent_payments;
CREATE POLICY "Owners and managers can view rent payments" ON rent_payments
  FOR SELECT USING (is_property_member(property_id, ARRAY['owner', 'manager']));
