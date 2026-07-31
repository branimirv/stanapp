-- Track property usage status changes over time.
-- One open row (ended_at IS NULL) per property represents the current status.

CREATE TABLE property_status_history (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id  UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  status       TEXT NOT NULL CHECK (status IN ('rented', 'personal_use', 'vacant', 'in_renovation')),
  started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at     TIMESTAMPTZ,
  changed_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_property_status_history_property
  ON property_status_history (property_id, started_at DESC);

CREATE UNIQUE INDEX property_status_history_open_unique
  ON property_status_history (property_id)
  WHERE ended_at IS NULL;

-- SECURITY DEFINER so the trigger can write history regardless of the
-- caller's RLS permissions (writes only ever happen through this trigger).
CREATE OR REPLACE FUNCTION record_property_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO property_status_history (property_id, status, started_at, changed_by)
    VALUES (NEW.id, NEW.usage_status, NOW(), auth.uid());
  ELSIF TG_OP = 'UPDATE' AND NEW.usage_status IS DISTINCT FROM OLD.usage_status THEN
    UPDATE property_status_history
    SET ended_at = NOW()
    WHERE property_id = NEW.id
      AND ended_at IS NULL;

    INSERT INTO property_status_history (property_id, status, started_at, changed_by)
    VALUES (NEW.id, NEW.usage_status, NOW(), auth.uid());
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_property_created_record_status
  AFTER INSERT ON properties
  FOR EACH ROW EXECUTE FUNCTION record_property_status_change();

CREATE TRIGGER on_property_status_changed
  AFTER UPDATE OF usage_status ON properties
  FOR EACH ROW EXECUTE FUNCTION record_property_status_change();

-- Backfill: seed an open entry per existing property from its creation date.
INSERT INTO property_status_history (property_id, status, started_at, changed_by)
SELECT p.id, p.usage_status, p.created_at, p.user_id
FROM properties p;

ALTER TABLE property_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view status history" ON property_status_history
  FOR SELECT USING (is_property_member(property_id));

GRANT SELECT ON property_status_history TO authenticated;
